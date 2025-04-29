
import { CategoryResponse, GiftsResponse, Gift } from '@/types';
import { toast } from 'sonner';

const API_BASE_URL = 'https://dummyjson.com';

// Fetch available product categories
export const fetchCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const categories: string[] = await response.json();
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Failed to fetch product categories');
    throw error;
  }
};

// Fetch products by category
export const fetchProductsByCategory = async (category: string): Promise<Gift[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products for category: ${category}`);
    }
    const data: GiftsResponse = await response.json();
    return data.products;
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    toast.error(`Failed to fetch products for ${category}`);
    throw error;
  }
};

// Fetch products from multiple categories and merge results
export const fetchProductsByCategories = async (categories: string[]): Promise<Gift[]> => {
  try {
    if (!categories || categories.length === 0) {
      toast.error('No categories found for your query');
      return [];
    }
    
    // Fetch products for each category in parallel
    const productPromises = categories.map(category => fetchProductsByCategory(category));
    const productsArrays = await Promise.all(productPromises);
    
    // Merge and deduplicate products
    const allProducts = productsArrays.flat();
    const uniqueProducts = Array.from(
      new Map(allProducts.map(product => [product.id, product])).values()
    );
    
    return uniqueProducts;
  } catch (error) {
    console.error('Error fetching products by categories:', error);
    toast.error('Failed to fetch gift suggestions');
    throw error;
  }
};
