
// This is a simulated backend endpoint - in a real app, this would be a server-side API

import { Request, Response } from 'express';
import { CartItem } from '@/types';

export default async function handler(req: Request, res: Response) {
  const { gift_ids } = req.body;
  
  if (!Array.isArray(gift_ids) || gift_ids.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid gift_ids. Expected a non-empty array.' 
    });
  }
  
  // Get existing cart items from localStorage
  const cartItemsJson = localStorage.getItem('db_cart') || '[]';
  const cartItems: CartItem[] = JSON.parse(cartItemsJson);
  
  // Hardcoded user ID for simplicity
  const user_id = 'user-123';
  
  // Create new cart items
  const now = new Date().toISOString();
  const newCartItems: CartItem[] = gift_ids.map((gift_id, index) => ({
    id: cartItems.length + index + 1, // Generate simple IDs
    user_id,
    gift_id,
    created_at: now
  }));
  
  // Add new items to the cart
  const updatedCart = [...cartItems, ...newCartItems];
  
  // Save back to localStorage
  localStorage.setItem('db_cart', JSON.stringify(updatedCart));
  
  res.status(200).json({
    success: true,
    added: newCartItems.length,
    total_cart_items: updatedCart.length
  });
}
