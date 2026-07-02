// apps/web/src/components/ui/ImageGallery.jsx

/**
 * @file components/ui/ImageGallery.jsx
 * @description Interactive image gallery for listing details.
 * Features a main display image and clickable thumbnails.
 */

import React, { useState } from 'react';

const ImageGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div style={{
        width: '100%',
        height: '400px',
        backgroundColor: 'var(--color-gray-100, #f3f4f6)',
        borderRadius: 'var(--radius-lg, 0.5rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-gray-500, #6b7280)',
      }}>
        No images available
      </div>
    );
  }

  const activeImage = images[activeIndex] || images[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 1rem)' }}>
      {/* Main Image */}
      <div style={{
        width: '100%',
        height: '500px',
        borderRadius: 'var(--radius-lg, 0.5rem)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-gray-100, #f3f4f6)',
      }}>
        <img
          src={activeImage.url}
          alt="Listing"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)`,
          gap: 'var(--space-2, 0.5rem)',
        }}>
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(index)}
              style={{
                width: '100%',
                height: '80px',
                borderRadius: 'var(--radius-md, 0.375rem)',
                overflow: 'hidden',
                border: activeIndex === index 
                  ? '2px solid var(--color-primary, #2563eb)' 
                  : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
                backgroundColor: 'transparent',
                transition: 'border-color var(--transition-fast, 0.2s)',
              }}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;