
// This is a simulated backend endpoint - in a real app, this would be a server-side API

import { Request, Response } from 'express';
import { Gift } from '@/types';

export default async function handler(req: Request, res: Response) {
  // Parse query parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string)?.toLowerCase() || '';
  
  // Calculate offset
  const offset = (page - 1) * limit;
  
  // Get gifts from localStorage (simulating a database)
  const giftsJson = localStorage.getItem('db_gifts') || '[]';
  const allGifts: Gift[] = JSON.parse(giftsJson);
  
  // Apply search filter if provided
  const filteredGifts = search
    ? allGifts.filter(gift => 
        gift.title.toLowerCase().includes(search) || 
        gift.description.toLowerCase().includes(search) ||
        gift.category.toLowerCase().includes(search) ||
        gift.brand.toLowerCase().includes(search)
      )
    : allGifts;
  
  // Apply pagination
  const paginatedGifts = filteredGifts.slice(offset, offset + limit);
  
  // Return paginated results
  res.status(200).json({
    gifts: paginatedGifts,
    total: filteredGifts.length,
    page,
    limit,
    totalPages: Math.ceil(filteredGifts.length / limit)
  });
}
