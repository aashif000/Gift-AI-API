
// This file mocks API endpoints for our frontend-only application
// In a real application, these would be actual server endpoints

import { Gift, CartItem } from './types';

// Intercept the fetch API to handle our simulated backend routes
const originalFetch = window.fetch;

window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  
  // If it's an OpenAI API call, pass it through to the original fetch
  if (url.startsWith('https://api.openai.com/')) {
    return originalFetch(input, init);
  }
  
  // If it's a DummyJSON API call, pass it through to the original fetch
  if (url.startsWith('https://dummyjson.com/')) {
    return originalFetch(input, init);
  }
  
  // API endpoint matchers
  if (url.startsWith('/api/')) {
    return handleApiRequest(url, init);
  }
  
  // Pass through to original fetch for all other requests
  return originalFetch(input, init);
};

// Try to get pool for API requests - simplified mock version
async function getPool() {
  const dbUrl = localStorage.getItem('postgres_db_url');
  if (!dbUrl) {
    return null;
  }
  
  try {
    // In a browser environment, we can't use actual pg Pool
    // This is just a mock for simulating functionality
    console.log('Would connect to PostgreSQL with URL:', dbUrl);
    return {
      connect: async () => {
        return {
          query: async (text: string, params: any[] = []) => {
            console.log('Mock PostgreSQL query:', text, params);
            return { rows: [] };
          },
          release: () => {}
        };
      }
    };
  } catch (error) {
    console.error('Error with mock database in API mock:', error);
    return null;
  }
}

// Handle API requests
async function handleApiRequest(url: string, init?: RequestInit): Promise<Response> {
  console.log(`[API Mock] ${init?.method || 'GET'} ${url}`);
  
  // Extract the path and query parameters
  const [path, queryString] = url.split('?');
  const query = queryString ? parseQueryString(queryString) : {};
  
  // Parse request body if present
  let body;
  if (init?.body) {
    try {
      body = JSON.parse(init.body.toString());
    } catch (e) {
      console.error('Error parsing request body:', e);
    }
  }
  
  // Database Initialization
  if (path === '/api/db/initialize') {
    // We'll handle this in the database service
    return mockResponse({
      success: true,
      message: 'Database initialized successfully',
      tables: ['gifts', 'cart']
    });
  }
  
  // Save gifts - will be handled by the database service
  if (path === '/api/db/gifts' && init?.method === 'POST') {
    const pool = await getPool();
    
    if (pool) {
      // Database handling will be done in the database service directly
      console.log('Saving gifts to PostgreSQL database');
      return mockResponse({
        success: true,
        message: 'Gifts saved to PostgreSQL database'
      });
    } else {
      // Fallback to localStorage
      const gifts: Gift[] = body.gifts || [];
      
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
      
      return mockResponse({
        success: true,
        gifts: uniqueGifts,
        count: uniqueGifts.length
      });
    }
  }
  
  // Get gifts - handled by the database service
  if (path === '/api/gifts') {
    // This is now handled in database.ts
    return mockResponse({
      message: 'This endpoint is now handled by database.ts'
    });
  }
  
  // Add to cart - handled by the database service
  if (path === '/api/cart/bulk-add' && init?.method === 'POST') {
    // This is now handled in database.ts
    return mockResponse({
      message: 'This endpoint is now handled by database.ts'
    });
  }
  
  // Get cart - handled by the database service
  if (path === '/api/cart') {
    // This is now handled in database.ts
    return mockResponse({
      message: 'This endpoint is now handled by database.ts'
    });
  }
  
  // If no route matched, return a 404
  return mockResponse({ error: 'Not found' }, 404);
}

// Helper function to parse query string
function parseQueryString(queryString: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pairs = queryString.split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    result[key] = decodeURIComponent(value || '');
  }
  
  return result;
}

// Helper function to create a mock response
function mockResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
