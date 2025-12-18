import { FoodItem, Restaurant, User } from './types';

export const CURRENT_USER_ID = 'user_123';

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_1',
    name: 'Burger & Co. Lagos',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/id/163/800/600',
    address: '12 Adetokunbo Ademola, VI',
    category: 'American',
    isOpen: true,
    status: 'APPROVED',
    businessRegNo: 'RC123456',
    bvn: '222****999'
  },
  {
    id: 'rest_2',
    name: 'Sushi Zen',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/id/292/800/600',
    address: '45 Admiralty Way, Lekki Phase 1',
    category: 'Japanese',
    isOpen: true,
    status: 'APPROVED',
    businessRegNo: 'RC987654',
    bvn: '222****888'
  },
  {
    id: 'rest_3',
    name: 'Mama Nkechi Kitchen',
    rating: 4.7,
    imageUrl: 'https://picsum.photos/id/493/800/600',
    address: '22 Isaac John St, Ikeja GRA',
    category: 'Local & Pasta',
    isOpen: true,
    status: 'APPROVED',
    businessRegNo: 'BN555555',
    bvn: '222****777'
  }
];

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'food_1',
    restaurantId: 'rest_1',
    name: 'Gourmet Smash Burger',
    description: 'Double patty, spicy mayo, cheese, brioche bun.',
    price: 6500.00,
    imageUrl: 'https://picsum.photos/id/835/600/800',
    prepTimeMinutes: 20,
    available: true,
    category: 'Burgers',
    likes: 1240,
    reviews: [
        { id: 'r1', userName: 'Tola', rating: 5, text: 'Best burger in VI!', timestamp: Date.now() - 100000, mediaUrl: 'https://picsum.photos/id/102/200/200' },
        { id: 'r2', userName: 'Chinedu', rating: 4, text: 'Very juicy.', timestamp: Date.now() - 200000 }
    ]
  },
  {
    id: 'food_2',
    restaurantId: 'rest_1',
    name: 'Yam Fries & Sauce',
    description: 'Crispy fried yam with pepper sauce.',
    price: 2500.00,
    imageUrl: 'https://picsum.photos/id/437/600/600',
    prepTimeMinutes: 15,
    available: true,
    category: 'Sides',
    likes: 856,
    reviews: [
         { id: 'r3', userName: 'Sarah', rating: 5, text: 'The sauce is fire 🔥', timestamp: Date.now() - 50000, mediaUrl: 'https://picsum.photos/id/103/200/200' }
    ]
  },
  {
    id: 'food_3',
    restaurantId: 'rest_2',
    name: 'Spicy Tuna Roll',
    description: 'Fresh tuna, spicy mayo, cucumber, sesame seeds.',
    price: 9000.00,
    imageUrl: 'https://picsum.photos/id/696/600/800',
    isVideo: true, 
    prepTimeMinutes: 15,
    available: true,
    category: 'Rolls',
    likes: 2100,
    reviews: [
        { id: 'r4', userName: 'Kemi', rating: 5, text: 'Authentic taste.', timestamp: Date.now() - 800000, mediaUrl: 'https://picsum.photos/id/104/200/200' },
        { id: 'r5', userName: 'Jide', rating: 5, text: 'Love the presentation', timestamp: Date.now() - 900000, mediaUrl: 'https://picsum.photos/id/106/200/200' }
    ]
  },
  {
    id: 'food_4',
    restaurantId: 'rest_2',
    name: 'Salmon Nigiri',
    description: 'Premium imported salmon over sushi rice.',
    price: 7500.00,
    imageUrl: 'https://picsum.photos/id/1080/600/600',
    prepTimeMinutes: 10,
    available: true,
    category: 'Nigiri',
    likes: 1500,
    reviews: []
  },
  {
    id: 'food_5',
    restaurantId: 'rest_3',
    name: 'Jollof Rice & Chicken',
    description: 'Smoky party jollof with grilled quarter chicken and plantain.',
    price: 4500.00,
    imageUrl: 'https://picsum.photos/id/794/600/800',
    prepTimeMinutes: 30,
    available: true,
    category: 'Mains',
    likes: 5430,
    reviews: [
        { id: 'r6', userName: 'Amaka', rating: 5, text: 'Proper Party Jollof!', timestamp: Date.now() - 10000, mediaUrl: 'https://picsum.photos/id/107/200/200' },
        { id: 'r7', userName: 'David', rating: 4, text: 'Chicken was huge.', timestamp: Date.now() - 40000 }
    ]
  }
];

export const MOCK_DAILY_STATS = [
  { day: 'Mon', orders: 45, revenue: 150000 },
  { day: 'Tue', orders: 52, revenue: 210000 },
  { day: 'Wed', orders: 38, revenue: 125000 },
  { day: 'Thu', orders: 65, revenue: 280000 },
  { day: 'Fri', orders: 85, revenue: 450000 },
  { day: 'Sat', orders: 120, revenue: 650000 },
  { day: 'Sun', orders: 100, revenue: 500000 },
];