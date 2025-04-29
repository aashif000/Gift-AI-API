import { CategoryResponse } from '@/types';
import { toast } from 'sonner';

// Store the API key in memory
let openaiApiKey = '';

// Validate the OpenAI API key
export const validateOpenAIKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Save the API key if valid
      openaiApiKey = apiKey;
      localStorage.setItem('openai_api_key', apiKey);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating OpenAI API key:', error);
    return false;
  }
};

// Get the stored API key
export const getOpenAIKey = (): string => {
  if (!openaiApiKey) {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      openaiApiKey = storedKey;
    }
  }
  return openaiApiKey;
};

// Get chat suggestions directly from OpenAI
export const getChatSuggestions = async (prompt: string): Promise<string> => {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    toast.error('OpenAI API key is required');
    throw new Error('OpenAI API key is required');
  }
  
  try {
    console.log('Processing prompt for chat suggestions');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a more cost-effective model
        messages: [
          {
            role: 'system',
            content: `You are a helpful gift recommendation assistant. Your task is to provide thoughtful gift suggestions 
            based on the user's query. Focus on giving practical, varied gift ideas with brief explanations for why they 
            would be good choices. Format your response as a well-organized list with categories. Don't include images or 
            links, just text-based recommendations.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    console.log('OpenAI response received');
    const content = data.choices[0]?.message?.content || '';
    
    if (!content) {
      throw new Error('No suggestions found in response');
    }
    
    return content;
    
  } catch (error: any) {
    console.error('Error getting chat suggestions from OpenAI:', error);
    toast.error(`AI error: ${error.message || 'Unknown error'}`);
    throw error;
  }
};

// Parse user prompt to identify relevant product categories (keeping for backward compatibility)
export const parseUserPrompt = async (
  prompt: string, 
  categories: string[]
): Promise<string[]> => {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    toast.error('OpenAI API key is required');
    throw new Error('OpenAI API key is required');
  }
  
  try {
    console.log('Processing prompt with categories:', categories);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a more cost-effective model
        messages: [
          {
            role: 'system',
            content: `You are a gift recommendation assistant. Your task is to analyze the user's prompt and identify which product categories from the provided list would be most relevant for gift suggestions. 

Available categories: ${categories.join(', ')}

Return ONLY a JSON object with an array of categories, like: {"categories": ["smartphones", "laptops"]}. 
Choose at least one category, even if it's not a perfect match. Do not include categories that are not in the provided list.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    console.log('OpenAI response:', data);
    const content = data.choices[0]?.message?.content || '';
    
    try {
      // Attempt to parse JSON response
      const parsedContent = JSON.parse(content);
      console.log('Parsed categories:', parsedContent.categories);
      if (!parsedContent.categories || parsedContent.categories.length === 0) {
        throw new Error('No categories found in response');
      }
      return parsedContent.categories || [];
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError, 'Content:', content);
      
      // Fallback: attempt to extract categories with regex if JSON parsing fails
      const matches = content.match(/"categories":\s*\[(.*?)\]/);
      if (matches && matches[1]) {
        const extractedCategories = matches[1]
          .split(',')
          .map(cat => cat.trim().replace(/"/g, ''))
          .filter(cat => categories.includes(cat));
        
        console.log('Extracted categories with regex:', extractedCategories);
        if (extractedCategories.length > 0) {
          return extractedCategories;
        }
      }
      
      // Last resort: look for quoted strings that match categories
      const categoryMatches = [];
      for (const category of categories) {
        if (content.includes(`"${category}"`) || content.includes(`'${category}'`)) {
          categoryMatches.push(category);
        }
      }
      
      console.log('Last resort category matches:', categoryMatches);
      if (categoryMatches.length > 0) {
        return categoryMatches;
      }
      
      // If all else fails, try to match the most relevant category
      const bestMatchCategory = findBestMatchCategory(prompt, categories);
      if (bestMatchCategory) {
        console.log('Best match category:', bestMatchCategory);
        return [bestMatchCategory];
      }
      
      return [];
    }
  } catch (error: any) {
    console.error('Error parsing user prompt with OpenAI:', error);
    toast.error(`AI error: ${error.message || 'Unknown error'}`);
    throw error;
  }
};

// Helper function to find the best matching category based on keywords (keeping for backward compatibility)
function findBestMatchCategory(prompt: string, categories: string[]): string | null {
  prompt = prompt.toLowerCase();
  
  // Define some common category keywords
  const categoryKeywords: Record<string, string[]> = {
    'smartphones': ['phone', 'smartphone', 'mobile', 'call', 'android', 'ios', 'tech'],
    'laptops': ['laptop', 'computer', 'pc', 'notebook', 'tech'],
    'fragrances': ['perfume', 'cologne', 'fragrance', 'scent', 'smell'],
    'skincare': ['skin', 'face', 'cream', 'lotion', 'beauty'],
    'groceries': ['food', 'snack', 'meal', 'grocery', 'eat'],
    'home-decoration': ['home', 'decor', 'decoration', 'house', 'interior', 'furnish'],
    'furniture': ['chair', 'table', 'sofa', 'desk', 'bed', 'furniture'],
    'tops': ['shirt', 'top', 'blouse', 'clothing', 'clothes'],
    'womens-dresses': ['dress', 'gown', 'women', 'fashion', 'clothing'],
    'womens-shoes': ['shoes', 'footwear', 'women', 'heels', 'fashion'],
    'mens-shirts': ['shirt', 'men', 'clothing', 'fashion'],
    'mens-shoes': ['shoes', 'footwear', 'men', 'fashion'],
    'mens-watches': ['watch', 'wrist', 'time', 'men', 'accessory'],
    'womens-watches': ['watch', 'wrist', 'time', 'women', 'accessory'],
    'womens-bags': ['bag', 'purse', 'handbag', 'women', 'accessory'],
    'womens-jewellery': ['jewelry', 'jewellery', 'necklace', 'ring', 'bracelet', 'women', 'accessory'],
    'sunglasses': ['sunglasses', 'glasses', 'eyewear', 'shades', 'accessory'],
    'automotive': ['car', 'auto', 'vehicle', 'automotive', 'drive'],
    'motorcycle': ['bike', 'motorcycle', 'cycling', 'ride'],
    'lighting': ['light', 'lamp', 'lighting', 'bulb', 'fixture']
  };
  
  // Assign scores to each category based on keyword matches
  const scores = categories.map(category => {
    let score = 0;
    
    // Check for direct category mention
    if (prompt.includes(category.toLowerCase())) {
      score += 10;
    }
    
    // Check for keywords
    const keywords = categoryKeywords[category] || [];
    for (const keyword of keywords) {
      if (prompt.includes(keyword)) {
        score += 5;
      }
    }
    
    // Special case handling for common gift categories
    if (prompt.includes('tech') && ['smartphones', 'laptops'].includes(category)) {
      score += 8;
    }
    
    if (prompt.includes('fashion') && ['womens-dresses', 'womens-shoes', 'mens-shirts', 'mens-shoes'].includes(category)) {
      score += 8;
    }
    
    return { category, score };
  });
  
  // Sort by score and take the highest
  scores.sort((a, b) => b.score - a.score);
  
  // Return the highest scoring category if it has any points
  if (scores.length > 0 && scores[0].score > 0) {
    return scores[0].category;
  }
  
  // If nothing matches well, return a random category from most common gift categories
  const commonGiftCategories = ['smartphones', 'laptops', 'fragrances', 'skincare', 'home-decoration']
    .filter(cat => categories.includes(cat));
  
  if (commonGiftCategories.length > 0) {
    return commonGiftCategories[Math.floor(Math.random() * commonGiftCategories.length)];
  }
  
  // Last resort: just return the first category
  return categories.length > 0 ? categories[0] : null;
}
