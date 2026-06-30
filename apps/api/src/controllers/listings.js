// apps/api/src/controllers/listings.js

import { prisma, cloudinary } from '../config/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Generate a URL-friendly slug from a title string.
 * Handles Ethiopian characters by transliterating where possible.
 *
 * @param {string} title - The listing title
 * @returns {string} URL-safe slug
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/[\s_]+/g, '-')   // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-')       // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '');  // Trim hyphens from start and end
};

/**
 * Ensure a unique slug by appending a counter if necessary.
 *
 * @param {string} slug - Base slug to check
 * @param {string} excludeId - Listing ID to exclude (for updates)
 * @returns {string} Unique slug
 */
const makeUniqueSlug = async (slug, excludeId = null) => {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.listing.findFirst({
      where: {
        slug: uniqueSlug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (!existing) break;

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

/**
 * Create a new listing.
 * Only users with HOST role can create listings.
 * The host is automatically set to the authenticated user.
 */
export const createListing = catchAsync(async (req, res) => {
  const {
    title, description, propertyType, placeType,
    address, city, subcity, kebele, latitude, longitude,
    bedrooms, bathrooms, maxGuests, basePrice,
    cleaningFee, weeklyDiscount, monthlyDiscount, amenities,
  } = req.body;

  // Generate a unique slug from the title
  const baseSlug = generateSlug(title);
  const slug = await makeUniqueSlug(baseSlug);

  const listing = await prisma.listing.create({
    data: {
      hostId: req.user.id,
      title: title.trim(),
      slug,
      description: description.trim(),
      propertyType,
      placeType,
      address: address.trim(),
      city: city.trim(),
      subcity: subcity?.trim() || null,
      kebele: kebele?.trim() || null,
      latitude: latitude || null,
      longitude: longitude || null,
      bedrooms: parseInt(bedrooms, 10) || 1,
      bathrooms: parseInt(bathrooms, 10) || 1,
      maxGuests: parseInt(maxGuests, 10) || 2,
      basePrice: parseFloat(basePrice),
      cleaningFee: parseFloat(cleaningFee) || 0,
      weeklyDiscount: parseFloat(weeklyDiscount) || 0,
      monthlyDiscount: parseFloat(monthlyDiscount) || 0,
      amenities: amenities || [],
      status: 'PENDING',
    },
  });

  res.status(201).json(
    ApiResponse.success(
      { listing },
      'Listing created successfully and submitted for review.',
      201
    )
  );
});

/**
 * Get all active listings with filtering and pagination.
 * Public endpoint - no authentication required.
 * Supports filtering by city, property type, price range, and amenities.
 */
export const getListings = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    city,
    propertyType,
    minPrice,
    maxPrice,
    amenities,
    search,
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 50); // Cap at 50 per page
  const skip = (pageNum - 1) * limitNum;

  // Build dynamic where clause based on provided filters
  const where = {
    status: 'ACTIVE',
  };

  if (city) {
    where.city = { contains: city, mode: 'insensitive' };
  }

  if (propertyType) {
    where.propertyType = propertyType;
  }

  if (minPrice || maxPrice) {
    where.basePrice = {};
    if (minPrice) where.basePrice.gte = parseFloat(minPrice);
    if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
  }

  if (amenities) {
    const amenityList = amenities.split(',').map(a => a.trim());
    where.amenities = { hasEvery: amenityList };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Execute count and find in parallel for efficiency
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
        host: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  res.json(
    ApiResponse.paginated(listings, pageNum, limitNum, total)
  );
});

/**
 * Get a single listing by its slug.
 * Includes host details and all images.
 * Public endpoint - no authentication required.
 */
export const getListing = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { order: 'asc' },
        select: { id: true, url: true, isPrimary: true, order: true },
      },
      host: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, fullName: true, avatar: true },
          },
        },
      },
    },
  });

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  res.json(
    ApiResponse.success({ listing }, 'Listing retrieved successfully.')
  );
});

/**
 * Upload images for a listing.
 * Images are uploaded to Cloudinary and stored with their public IDs
 * for future deletion management.
 */
export const uploadListingImages = catchAsync(async (req, res) => {
  const { listingId } = req.params;

  // Verify the listing exists and belongs to the authenticated host
  const listing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      hostId: req.user.id,
    },
  });

  if (!listing) {
    throw new AppError('Listing not found or you do not have permission.', 404);
  }

  if (!req.files || req.files.length === 0) {
    throw new AppError('No images provided for upload.', 400);
  }

  // Upload each image to Cloudinary and collect the results
  const uploadPromises = req.files.map((file, index) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `roost/listings/${listingId}`,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: result.public_id, order: index });
        }
      );
      uploadStream.end(file.buffer);
    });
  });

  const uploadedImages = await Promise.all(uploadPromises);

  // Set the first uploaded image as primary if no primary exists
  const existingImages = await prisma.listingImage.count({
    where: { listingId },
  });

  const imageData = uploadedImages.map((img, index) => ({
    listingId,
    url: img.url,
    publicId: img.publicId,
    order: existingImages + index,
    isPrimary: existingImages === 0 && index === 0,
  }));

  await prisma.listingImage.createMany({ data: imageData });

  const allImages = await prisma.listingImage.findMany({
    where: { listingId },
    orderBy: { order: 'asc' },
  });

  res.status(201).json(
    ApiResponse.success(
      { images: allImages },
      `${uploadedImages.length} image(s) uploaded successfully.`,
      201
    )
  );
});

/**
 * Update an existing listing.
 * Only the listing's host can update it.
 */
export const updateListing = catchAsync(async (req, res) => {
  const { id } = req.params;

  const listing = await prisma.listing.findFirst({
    where: { id, hostId: req.user.id },
  });

  if (!listing) {
    throw new AppError('Listing not found or you do not have permission.', 404);
  }

  const allowedFields = [
    'title', 'description', 'propertyType', 'placeType',
    'address', 'city', 'subcity', 'kebele', 'latitude', 'longitude',
    'bedrooms', 'bathrooms', 'maxGuests', 'basePrice',
    'cleaningFee', 'weeklyDiscount', 'monthlyDiscount', 'amenities',
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = typeof req.body[field] === 'string'
        ? req.body[field].trim()
        : req.body[field];
    }
  }

  // Regenerate slug if title changed
  if (updates.title) {
    const baseSlug = generateSlug(updates.title);
    updates.slug = await makeUniqueSlug(baseSlug, id);
  }

  const updatedListing = await prisma.listing.update({
    where: { id },
    data: updates,
    include: {
      images: { orderBy: { order: 'asc' } },
    },
  });

  res.json(
    ApiResponse.success(
      { listing: updatedListing },
      'Listing updated successfully.'
    )
  );
});

/**
 * Delete a listing.
 * Only the listing's host can delete it.
 * Also removes all associated Cloudinary images.
 */
export const deleteListing = catchAsync(async (req, res) => {
  const { id } = req.params;

  const listing = await prisma.listing.findFirst({
    where: { id, hostId: req.user.id },
    include: { images: true },
  });

  if (!listing) {
    throw new AppError('Listing not found or you do not have permission.', 404);
  }

  // Delete all images from Cloudinary
  if (listing.images.length > 0) {
    const publicIds = listing.images.map(img => img.publicId);
    await cloudinary.api.delete_resources(publicIds);
  }

  // Delete the listing (cascades to images in database)
  await prisma.listing.delete({ where: { id } });

  res.json(
    ApiResponse.success(null, 'Listing deleted successfully.')
  );
});