import { Gift, CartItem } from '@/types';
import { toast } from 'sonner';

// Modified PostgreSQL mock for frontend use
interface MockClient {
  query: (text: string, params?: any[]) => Promise<any>;
  release: () => void;
}

interface MockPool {
  connect: () => Promise<MockClient>;
  end?: () => Promise<void>;
}

// Global pool instance
let pool: MockPool | null = null;

// PostgreSQL connection configuration
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    const dbUrl = localStorage.getItem('postgres_db_url');
    
    if (!dbUrl) {
      console.log('No database URL found, will prompt for it');
      return false;
    }
    
    // Create a connection pool (mock implementation for browser)
    pool = createMockPool(dbUrl);
    
    // Test the connection
    const client = await pool.connect();
    console.log('Database connected successfully');
    
    // Run migrations
    await runMigrations(client);
    
    client.release();
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    toast.error('Failed to connect to database. Please check your connection settings.');
    return false;
  }
};

// Create a mock pool for browser environment
function createMockPool(connectionString: string): MockPool {
  console.log('Creating mock PostgreSQL pool with connection string:', connectionString);
  
  return {
    connect: async () => {
      return {
        query: async (text: string, params: any[] = []) => {
          console.log('Mock PostgreSQL query:', text, params);
          
          // Simulate query responses based on the query text
          if (text.includes('SELECT COUNT(*)')) {
            return { rows: [{ count: "10" }] };
          }
          
          if (text.includes('SELECT * FROM gifts')) {
            // For now, just return data from localStorage
            const giftsJson = localStorage.getItem('db_gifts') || '[]';
            const gifts = JSON.parse(giftsJson);
            return { rows: gifts };
          }
          
          if (text.includes('SELECT c.*, g.*')) {
            // Return cart items with joined gift data
            const cartItemsJson = localStorage.getItem('db_cart') || '[]';
            const cartItems = JSON.parse(cartItemsJson);
            const giftsJson = localStorage.getItem('db_gifts') || '[]';
            const gifts = JSON.parse(giftsJson);
            
            // Join cart items with gifts (simulating a SQL JOIN)
            const results = cartItems.map((item: any) => {
              const gift = gifts.find((g: any) => g.id === item.gift_id);
              if (!gift) return null;
              
              return {
                id: item.id,
                user_id: item.user_id,
                gift_id: item.gift_id,
                created_at: new Date(),
                ...gift
              };
            }).filter(Boolean);
            
            return { rows: results };
          }
          
          return { rows: [] };
        },
        release: () => {}
      };
    }
  };
}

// Test database connection
export const testDatabaseConnection = async (dbUrl: string): Promise<boolean> => {
  try {
    // In a browser environment, we can't actually connect to PostgreSQL
    // So we'll just validate the URL format and save it
    if (!dbUrl || !dbUrl.startsWith('postgresql://')) {
      console.error('Invalid PostgreSQL connection string format');
      return false;
    }
    
    // Save the database URL
    localStorage.setItem('postgres_db_url', dbUrl);
    console.log('Test database connection successful (simulated)');
    
    // Create a mock pool for immediate testing
    const testPool = createMockPool(dbUrl);
    const client = await testPool.connect();
    
    // Run migrations with this client
    await runMigrations(client);
    
    client.release();
    
    return true;
  } catch (error) {
    console.error('Test database connection error:', error);
    return false;
  }
};

// Create required tables if they don't exist
async function runMigrations(client: MockClient) {
  // In a browser environment, these queries won't actually run
  // But we'll keep them for documentation and mock purposes
  
  // Create gifts table
  await client.query(`
    CREATE TABLE IF NOT EXISTS gifts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      discount_percentage DECIMAL(5, 2),
      rating DECIMAL(3, 2),
      stock INTEGER,
      brand VARCHAR(100),
      category VARCHAR(100),
      thumbnail TEXT,
      images TEXT[]
    );
  `);
  
  // Create cart table
  await client.query(`
    CREATE TABLE IF NOT EXISTS cart (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      gift_id INTEGER NOT NULL REFERENCES gifts(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('Database migrations completed successfully (simulated)');
}

// Save gifts to the database
export const saveGifts = async (gifts: Gift[]): Promise<Gift[]> => {
  if (!pool) {
    const initialized = await initializeDatabase();
    if (!initialized) {
      throw new Error('Database not initialized');
    }
  }
  
  try {
    const client = await pool!.connect();
    
    // In browser environment, store in localStorage instead
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
    
    client.release();
    return gifts;
  } catch (error) {
    console.error('Error saving gifts to database:', error);
    toast.error('Failed to save gifts to database');
    throw error;
  }
};

// Get paginated gifts from the database
export const getGifts = async (page: number = 1, limit: number = 10, search?: string): Promise<{ gifts: Gift[], total: number }> => {
  if (!pool) {
    const initialized = await initializeDatabase();
    if (!initialized) {
      return { gifts: [], total: 0 };
    }
  }
  
  try {
    // In browser environment, use localStorage instead
    console.log('Fetching gifts from mock database');
    
    // Get gifts from localStorage
    const giftsJson = localStorage.getItem('db_gifts') || '[]';
    const allGifts: Gift[] = JSON.parse(giftsJson);
    
    // Apply search filter if provided
    const filteredGifts = search
      ? allGifts.filter(gift => 
          gift.title.toLowerCase().includes(search.toLowerCase()) || 
          gift.description.toLowerCase().includes(search.toLowerCase()) ||
          gift.category.toLowerCase().includes(search.toLowerCase()) ||
          gift.brand.toLowerCase().includes(search.toLowerCase())
        )
      : allGifts;
    
    // Filter out iPhones
    const giftsWithoutIphones = filteredGifts.filter(gift => 
      !(gift.category === 'smartphones' && 
        (gift.title.toLowerCase().includes('iphone') || 
         gift.description.toLowerCase().includes('iphone')))
    );
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedGifts = giftsWithoutIphones.slice(offset, offset + limit);
    
    return {
      gifts: paginatedGifts,
      total: giftsWithoutIphones.length
    };
  } catch (error) {
    console.error('Error fetching gifts from database:', error);
    toast.error('Failed to fetch gifts from database');
    
    // Return empty results
    return { gifts: [], total: 0 };
  }
};

// Add multiple gifts to the cart
export const addGiftsToCart = async (giftIds: number[]): Promise<{ success: boolean }> => {
  if (!pool) {
    const initialized = await initializeDatabase();
    if (!initialized) {
      throw new Error('Database not initialized');
    }
  }
  
  try {
    const client = await pool!.connect();
    
    // In browser environment, store in localStorage instead
    // Get existing cart from localStorage
    const cartItemsJson = localStorage.getItem('db_cart') || '[]';
    const cartItems: CartItem[] = JSON.parse(cartItemsJson);
    
    // Hardcoded user ID for simplicity
    const user_id = 'user-123';
    
    // Create new cart items
    const now = new Date().toISOString();
    const newCartItems: CartItem[] = giftIds.map((gift_id, index) => ({
      id: cartItems.length + index + 1, // Generate simple IDs
      user_id,
      gift_id,
      created_at: now
    }));
    
    // Add new items to the cart
    const updatedCart = [...cartItems, ...newCartItems];
    
    // Save back to localStorage
    localStorage.setItem('db_cart', JSON.stringify(updatedCart));
    
    client.release();
    return { success: true };
  } catch (error) {
    console.error('Error adding gifts to cart:', error);
    toast.error('Failed to add items to cart');
    throw error;
  }
};

// Get all items in the cart
export const getCart = async (): Promise<CartItem[]> => {
  if (!pool) {
    const initialized = await initializeDatabase();
    if (!initialized) {
      return [];
    }
  }
  
  try {
    const client = await pool!.connect();
    
    // In browser environment, use localStorage instead
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
    const result = userCartItems.map(cartItem => {
      const gift = gifts.find(g => g.id === cartItem.gift_id);
      return {
        ...cartItem,
        gift
      };
    });
    
    client.release();
    return result;
  } catch (error) {
    console.error('Error fetching cart from database:', error);
    toast.error('Failed to fetch cart items');
    return [];
  }
};
