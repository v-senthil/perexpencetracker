export const CATEGORIES = [
  { id: 'food', label: 'Food', emoji: '🍔', color: '#ef4444' },
  { id: 'travel', label: 'Travel', emoji: '🚗', color: '#3b82f6' },
  { id: 'stay', label: 'Stay', emoji: '🏨', color: '#8b5cf6' },
  { id: 'activities', label: 'Activities', emoji: '🎟️', color: '#f59e0b' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#ec4899' },
  { id: 'others', label: 'Others', emoji: '📦', color: '#6b7280' },
];

const KEYWORD_MAP = {
  food: [
    'food', 'eat', 'restaurant', 'lunch', 'dinner', 'breakfast', 'snack',
    'pizza', 'burger', 'coffee', 'tea', 'chai', 'juice', 'drink', 'beer',
    'wine', 'bar', 'pub', 'cafe', 'bakery', 'dessert', 'ice cream',
    'biryani', 'dosa', 'thali', 'noodle', 'pasta', 'sandwich', 'salad',
    'chicken', 'fish', 'mutton', 'paneer', 'dal', 'rice', 'roti', 'naan',
    'sweets', 'chocolate', 'cake', 'fries', 'momos', 'chaat', 'pani puri',
    'samosa', 'vada', 'idli', 'paratha', 'maggi', 'chips', 'biscuit',
    'water bottle', 'soda', 'cocktail', 'mocktail', 'smoothie', 'milkshake',
    'zomato', 'swiggy', 'uber eats', 'dominos', 'mcdonalds', 'kfc',
    'starbucks', 'canteen', 'mess', 'tiffin', 'brunch', 'supper',
  ],
  travel: [
    'cab', 'taxi', 'auto', 'rickshaw', 'uber', 'ola', 'rapido', 'bus',
    'train', 'metro', 'flight', 'airplane', 'airport', 'petrol', 'diesel',
    'fuel', 'gas', 'toll', 'parking', 'bike', 'rent a car', 'car rental',
    'ferry', 'boat', 'cruise', 'ticket', 'transport', 'commute', 'ride',
    'scooter', 'tuk tuk', 'e-rickshaw', 'lyft', 'grab',
  ],
  stay: [
    'hotel', 'hostel', 'resort', 'airbnb', 'room', 'lodge', 'motel',
    'accommodation', 'stay', 'booking', 'oyo', 'treehouse', 'villa',
    'homestay', 'guest house', 'cottage', 'tent', 'camp', 'glamping',
    'check-in', 'check in', 'checkout', 'night stay',
  ],
  activities: [
    'activity', 'adventure', 'tour', 'museum', 'park', 'temple', 'church',
    'monument', 'beach', 'trek', 'hike', 'safari', 'diving', 'snorkel',
    'surfing', 'kayak', 'rafting', 'bungee', 'zip line', 'paragliding',
    'skydiving', 'spa', 'massage', 'yoga', 'gym', 'pool', 'waterpark',
    'amusement', 'theme park', 'concert', 'show', 'movie', 'cinema',
    'club', 'nightlife', 'event', 'festival', 'sightseeing', 'guide',
    'entry fee', 'entrance', 'ticket', 'game', 'sport',
  ],
  shopping: [
    'shop', 'shopping', 'mall', 'market', 'souvenir', 'gift', 'clothes',
    'dress', 'shoes', 'bag', 'jewelry', 'jewellery', 'watch', 'accessory',
    'handicraft', 'art', 'painting', 'pottery', 'spice', 'local market',
    'flea market', 'antique', 'electronics', 'gadget', 'perfume',
    'cosmetics', 'makeup', 'sunglasses', 'hat', 'scarf', 'keychain',
    'magnet', 'postcard', 'book', 'amazon', 'flipkart',
  ],
};

export function categorizeExpense(description) {
  const text = description.toLowerCase().trim();

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }

  return 'others';
}

export function getCategoryInfo(categoryId) {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[5];
}
