// apps/web/src/pages/CreateListing.jsx

/**
 * @file pages/CreateListing.jsx
 * @description Complete listing creation page.
 * Allows hosts to create new listings and upload images via FormData.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createListing, uploadListingImages } from '../services/listings';
import Button from '../components/ui/Button';

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    placeType: 'ENTIRE_PLACE',
    address: '',
    city: '',
    subcity: '',
    kebele: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    basePrice: '',
    cleaningFee: 0,
    weeklyDiscount: 0,
    monthlyDiscount: 0,
    amenities: [],
  });
  
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }
    setImages(files);
    setError('');
    
    const previews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    }));
    setImagePreviews(previews);
  };
  
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Step 1: Create the listing
      const listingResponse = await createListing(formData);
      const listingId = listingResponse.data.data.listing.id;
      
      // Step 2: Upload images if any
      if (images.length > 0) {
        setUploadProgress({ current: 0, total: images.length });
        
        const formDataImages = new FormData();
        images.forEach((file) => {
          formDataImages.append('images', file);
        });
        
        await uploadListingImages(listingId, formDataImages);
        setUploadProgress({ current: images.length, total: images.length });
      }
      
      // Step 3: Redirect to listing detail page
      navigate(`/listings/${listingResponse.data.data.listing.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };
  
  if (!user || (user.role !== 'HOST' && user.role !== 'ADMIN')) {
    return (
      <div style={{ padding: 'var(--space-8, 2rem)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl, 1.5rem)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-gray-900, #111827)' }}>Access Denied</h2>
        <p style={{ marginTop: 'var(--space-2, 0.5rem)', color: 'var(--color-gray-600, #4b5563)' }}>You must be a host to create listings.</p>
      </div>
    );
  }
  
  const inputStyle = {
    width: '100%',
    padding: 'var(--space-2, 0.5rem) var(--space-3, 0.75rem)',
    border: '1px solid var(--color-gray-300, #d1d5db)',
    borderRadius: 'var(--radius-md, 0.375rem)',
    fontSize: 'var(--font-size-md, 1rem)',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 'var(--font-size-sm, 0.875rem)',
    fontWeight: 'var(--font-weight-medium, 500)',
    color: 'var(--color-gray-700, #374151)',
    marginBottom: 'var(--space-1, 0.25rem)',
  };

  const sectionStyle = {
    backgroundColor: 'var(--color-white, #ffffff)',
    boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
    borderRadius: 'var(--radius-lg, 0.5rem)',
    padding: 'var(--space-6, 1.5rem)',
    marginBottom: 'var(--space-6, 1.5rem)',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-8, 2rem) var(--space-4, 1rem)' }}>
      <h1 style={{ fontSize: 'var(--font-size-3xl, 1.875rem)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-gray-900, #111827)', marginBottom: 'var(--space-8, 2rem)' }}>Create New Listing</h1>
      
      {error && (
        <div style={{ backgroundColor: 'var(--color-red-50, #fef2f2)', border: '1px solid var(--color-red-200, #fecaca)', color: 'var(--color-red-700, #b91c1c)', padding: 'var(--space-3, 0.75rem) var(--space-4, 1rem)', borderRadius: 'var(--radius-md, 0.375rem)', marginBottom: 'var(--space-6, 1.5rem)' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-gray-900, #111827)', marginBottom: 'var(--space-4, 1rem)' }}>Basic Information</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 1rem)' }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} />
            </div>
            
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4, 1rem)' }}>
              <div>
                <label style={labelStyle}>Property Type *</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} style={inputStyle}>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="STUDIO">Studio</option>
                </select>
              </div>
              
              <div>
                <label style={labelStyle}>Place Type *</label>
                <select name="placeType" value={formData.placeType} onChange={handleChange} style={inputStyle}>
                  <option value="ENTIRE_PLACE">Entire Place</option>
                  <option value="PRIVATE_ROOM">Private Room</option>
                  <option value="SHARED_ROOM">Shared Room</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-gray-900, #111827)', marginBottom: 'var(--space-4, 1rem)' }}>Location</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 1rem)' }}>
            <div>
              <label style={labelStyle}>Address *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required style={inputStyle} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4, 1rem)' }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required style={inputStyle} />
              </div>
              
              <div>
                <label style={labelStyle}>Subcity</label>
                <input type="text" name="subcity" value={formData.subcity} onChange={handleChange} style={inputStyle} />
              </div>
              
              <div>
                <label style={labelStyle}>Kebele</label>
                <input type="text" name="kebele" value={formData.kebele} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Property Details */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-gray-900, #111827)', marginBottom: 'var(--space-4, 1rem)' }}>Property Details</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4, 1rem)' }}>
            <div>
              <label style={labelStyle}>Bedrooms *</label>
              <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min="1" required style={inputStyle} />
            </div>
            
            <div>
              <label style={labelStyle}>Bathrooms *</label>
              <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min="1" required style={inputStyle} />
            </div>
            
            <div>
              <label style={labelStyle}>Max Guests *</label>
              <input type="number" name="maxGuests" value={formData.maxGuests} onChange={handleChange} min="1" required style={inputStyle} />
            </div>
          </div>
        </div>
        
        {/* Pricing */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-gray-900, #111827)', marginBottom: 'var(--space-4, 1rem)' }}>Pricing</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4, 1rem)' }}>
            <div>
              <label style={labelStyle}>Base Price (per night) *</label>
              <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} min="0" step="0.01" required style={inputStyle} />
            </div>
            
            <div>
              <label style={labelStyle}>Cleaning Fee</label>
              <input type="number" name="cleaningFee" value={formData.cleaningFee} onChange={handleChange} min="0" step="0.01" style={inputStyle} />
            </div>
            
            <div>
              <label style={labelStyle}>Weekly Discount (%)</label>
              <input type="number" name="weeklyDiscount" value={formData.weeklyDiscount} onChange={handleChange} min="0" max="100" style={inputStyle} />
            </div>
            
            <div>
              <label style={labelStyle}>Monthly Discount (%)</label>
              <input type="number" name="monthlyDiscount" value={formData.monthlyDiscount} onChange={handleChange} min="0" max="100" style={inputStyle} />
            </div>
          </div>
        </div>
        
        {/* Images */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-gray-900, #111827)', marginBottom: 'var(--space-4, 1rem)' }}>Images</h2>
          
          <div>
            <label style={labelStyle}>Upload Images (Max 10)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleImageChange} style={{ ...inputStyle, padding: 'var(--space-2, 0.5rem)' }} />
            {images.length > 0 && (
              <p style={{ marginTop: 'var(--space-2, 0.5rem)', fontSize: 'var(--font-size-sm, 0.875rem)', color: 'var(--color-gray-600, #4b5563)' }}>
                {images.length} image(s) selected
              </p>
            )}
          </div>
          
          {uploadProgress.total > 0 && (
            <div style={{ marginTop: 'var(--space-4, 1rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm, 0.875rem)', color: 'var(--color-gray-600, #4b5563)', marginBottom: 'var(--space-1, 0.25rem)' }}>
                <span>Uploading...</span>
                <span>{uploadProgress.current} / {uploadProgress.total}</span>
              </div>
              <div style={{ width: '100%', backgroundColor: 'var(--color-gray-200, #e5e7eb)', borderRadius: '9999px', height: '8px' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-primary, #2563eb)',
                    height: '100%',
                    borderRadius: '9999px',
                    transition: 'width 0.3s',
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {imagePreviews.length > 0 && (
            <div style={{ marginTop: 'var(--space-4, 1rem)' }}>
              <h3 style={{ fontSize: 'var(--font-size-sm, 0.875rem)', fontWeight: 'var(--font-weight-medium, 500)', color: 'var(--color-gray-700, #374151)', marginBottom: 'var(--space-2, 0.5rem)' }}>Image Previews</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-4, 1rem)' }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img src={preview.url} alt={preview.name} style={{ width: '100%', height: '128px', objectFit: 'cover', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-gray-200, #e5e7eb)' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={isSubmitting}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'var(--color-red-500, #ef4444)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '12px', padding: '8px', borderRadius: '0 0 var(--radius-lg, 0.5rem) var(--radius-lg, 0.5rem)' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview.name}</div>
                      <div>{preview.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4, 1rem)' }}>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting || images.length === 0} loading={isSubmitting}>
            {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;