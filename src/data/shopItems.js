export const SHOP_ITEMS = {
  clothing: [
    { id: 'hat1', name: 'Cool Hat', emoji: '🎩', price: 15, description: 'A stylish hat for your hardworking kiddo.' },
    { id: 'hat2', name: 'Party Hat', emoji: '🎉', price: 12, description: 'Celebrate chore victories in style.' },
    { id: 'glasses', name: 'Sunglasses', emoji: '🕶️', price: 10, description: 'Stay cool while doing chores.' },
    { id: 'crown', name: 'Royal Crown', emoji: '👑', price: 25, description: 'A royal reward for top performers.' },
    { id: 'bow', name: 'Cute Bow', emoji: '🎀', price: 8, description: 'Adorable accessory for your pet.' },
  ],
  accessories: [
    { id: 'ball', name: 'Play Ball', emoji: '⚽', price: 5, description: 'Keep your pet active and happy.' },
    { id: 'bone', name: 'Treat Bone', emoji: '🦴', price: 7, description: 'A tasty treat for loyal pets.' },
    { id: 'toy', name: 'Toy Mouse', emoji: '🐭', price: 6, description: 'Perfect for playful kitties.' },
    { id: 'star', name: 'Star Badge', emoji: '⭐', price: 20, description: 'Show off chore mastery.' },
  ],
  backgrounds: [
    { id: 'bg1', name: 'Garden', emoji: '🌳', price: 30, description: 'A lush green getaway.', gradient: 'from-green-300 to-green-500' },
    { id: 'bg2', name: 'Beach', emoji: '🏖️', price: 30, description: 'Sunny vibes for sunny chores.', gradient: 'from-yellow-300 to-blue-400' },
    { id: 'bg3', name: 'Space', emoji: '🚀', price: 40, description: 'Launch into adventure.', gradient: 'from-purple-900 to-blue-900' },
    { id: 'bg4', name: 'Castle', emoji: '🏰', price: 50, description: 'Fit for chore royalty.', gradient: 'from-gray-400 to-purple-600' },
  ],
};

export const REWARD_CATEGORIES = [
  { value: 'all', label: 'All categories' },
  { value: 'clothing', label: 'Clothing & hats' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'backgrounds', label: 'Backgrounds' },
];
