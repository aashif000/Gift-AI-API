// API Response Types
export interface Category {
  name: string;
}

export interface Gift {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface GiftsResponse {
  products: Gift[];
  total: number;
  skip: number;
  limit: number;
}

export interface CategoryResponse {
  categories: string[];
}

// Database Types
export interface CartItem {
  id: number;
  user_id: string;
  gift_id: number;
  created_at: string;
  gift?: Gift;
}

// OpenAI API Types
export interface OpenAIChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
  index: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Chat Suggestion Types
export interface ChatSuggestion {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}
