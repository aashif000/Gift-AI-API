
// This is a simulated backend endpoint - in a real app, this would be a server-side API

import { Request, Response } from 'express';
import { CartItem, Gift } from '@/types';

export default async function handler(req: Request, res: Response) {
  // Hardcoded user ID for simplicity
  const user_id = 'user-123';
  
  // Get cart items from localStorage
  const cartItemsJson = localStorage.getItem('db_cart') || '[]';
  const cartItems: CartItem[] = JSON.parse(cartItemsJson);
  
  // Filter cart items for the current user
  const userCartItems = cartItems.filter(item => item.user_id === user_id);
  
  // Get gifts from localStorage
  const giftsJson = localStorage.getItem('db_gifts') || '[]';
  const gifts: Gift[] = JSON.parse(giftsJson);
  
  // Join cart items with gifts (simulating a SQL JOIN)
  const cartWithGifts = userCartItems.map(cartItem => {
    const gift = gifts.find(g => g.id === cartItem.gift_id);
    return {
      ...cartItem,
      gift
    };
  });
  
  res.status(200).json({
    success: true,
    items: cartWithGifts
  });
}
