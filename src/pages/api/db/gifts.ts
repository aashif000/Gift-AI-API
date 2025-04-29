
// This is a simulated backend endpoint - in a real app, this would be a server-side API

import { Request, Response } from 'express';
import { Gift } from '@/types';

export default async function handler(req: Request, res: Response) {
  // In a real implementation, this would insert gifts into PostgreSQL
  // For this demo, we'll use localStorage to simulate database storage
  
  const { gifts } = req.body as { gifts: Gift[] };
  
  // Get existing gifts from localStorage
  const existingGiftsJson = localStorage.getItem('db_gifts') || '[]';
  let existingGifts: Gift[] = JSON.parse(existingGiftsJson);
  
  // Deduplicate gifts based on id
  const uniqueGifts = [...existingGifts];
  
  for (const gift of gifts) {
    const existingIndex = uniqueGifts.findIndex(g => g.id === gift.id);
    if (existingIndex >= 0) {
      // Update existing gift
      uniqueGifts[existingIndex] = gift;
    } else {
      // Add new gift
      uniqueGifts.push(gift);
    }
  }
  
  // Save back to localStorage
  localStorage.setItem('db_gifts', JSON.stringify(uniqueGifts));
  
  // Return the saved gifts
  res.status(200).json({
    success: true,
    gifts: uniqueGifts,
    count: uniqueGifts.length
  });
}
