// apps/api/src/controllers/listings.js

/**
 * @file controllers/listings.js
 * @description Listing management controllers.
 * Handles creation, retrieval, updates, deletion, and image uploads.
 */

import { prisma, cloudinary } from '../config/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Generate a URL-friendly slug from a title string.
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Ensure a unique slug by appending a counter if necessary.
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
 */
export const createListing = catchAsync(async (req, res) => {
  const {
    title, description, propertyType, placeType,
    address, city, subcity, kebele, latitude, longitude,
    bedrooms, bathrooms, maxGuests, basePrice,
    cleaningFee, weeklyDiscount, monthlyDiscount, amenities,
  } = req.body;
  
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
  const limitNum = Math.min(parseInt(limit, 10), 50);
  const skip = (pageNum - 1) * limitNum;
  
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
 * Get all listings for the authenticated host.
 */
export const getHostListings = catchAsync(async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { hostId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true },
      },
      _count: {
        select: { bookings: true },
      },
    },
  });
  
  res.json(
    ApiResponse.success({ listings }, 'Host listings retrieved successfully.')
  );
});

/**
 * Get a single listing by its slug.
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
 */
export const uploadListingImages = catchAsync(async (req, res) => {
  const { listingId } = req.params;
  
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
  
  if (listing.images.length > 0) {
    const publicIds = listing.images.map(img => img.publicId);
    await cloudinary.api.delete_resources(publicIds);
  }
  
  await prisma.listing.delete({ where: { id } });
  
  res.json(
    ApiResponse.success(null, 'Listing deleted successfully.')
  );
});