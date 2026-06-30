// ROOST Listing Configuration
// Property types, amenities, rules - all config-driven

const listingConfig = {
  propertyTypes: [
    { id: 'house', label: 'House', icon: '🏠' },
    { id: 'apartment', label: 'Apartment', icon: '🏢' },
    { id: 'villa', label: 'Villa', icon: '🏡' },
    { id: 'guesthouse', label: 'Guest House', icon: '🏨' },
    { id: 'traditional', label: 'Traditional Home', icon: '🛖' },
    { id: 'condo', label: 'Condominium', icon: '🏗️' },
  ],

  placeTypes: [
    { id: 'entire_place', label: 'Entire Place' },
    { id: 'private_room', label: 'Private Room' },
    { id: 'shared_room', label: 'Shared Room' },
  ],

  amenities: [
    { id: 'wifi', label: 'WiFi', icon: '📶', category: 'essentials' },
    { id: 'kitchen', label: 'Kitchen', icon: '🍳', category: 'essentials' },
    { id: 'parking', label: 'Free Parking', icon: '🅿️', category: 'essentials' },
    { id: 'tv', label: 'TV', icon: '📺', category: 'essentials' },
    { id: 'ac', label: 'Air Conditioning', icon: '❄️', category: 'essentials' },
    { id: 'workspace', label: 'Workspace', icon: '💻', category: 'essentials' },
    { id: 'hot_water', label: 'Hot Water', icon: '🚿', category: 'bathroom' },
    { id: 'towels', label: 'Towels', icon: '🧴', category: 'bathroom' },
    { id: 'balcony', label: 'Balcony', icon: '🌅', category: 'outdoor' },
    { id: 'garden', label: 'Garden', icon: '🌿', category: 'outdoor' },
    { id: 'generator', label: 'Backup Generator', icon: '⚡', category: 'local' },
    { id: 'water_tank', label: 'Water Tank', icon: '💧', category: 'local' },
    { id: 'coffee', label: 'Coffee Ceremony', icon: '☕', category: 'local' },
  ],

  statuses: [
    { id: 'draft', label: 'Draft', color: 'gray' },
    { id: 'pending', label: 'Pending Review', color: 'yellow' },
    { id: 'active', label: 'Active', color: 'green' },
    { id: 'inactive', label: 'Inactive', color: 'red' },
  ],
};

export default listingConfig;
