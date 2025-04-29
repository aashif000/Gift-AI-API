
import { useState, useEffect } from 'react';
import { fetchCategories } from '@/services/api';
import { getChatSuggestions } from '@/services/openai';
import { initializeDatabase } from '@/services/database';
import { toast } from 'sonner';

// Components
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import SuggestionDisplay from '@/components/SuggestionDisplay';
import ApiKeyModal from '@/components/ApiKeyModal';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [suggestionsContent, setSuggestionsContent] = useState('');
  const [cartCount, setCartCount] = useState(0);
  
  // Initialize
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize database
        await initializeDatabase();
        
        // Check for OpenAI API key
        const apiKey = localStorage.getItem('openai_api_key');
        const dbUrl = localStorage.getItem('postgres_db_url');
        
        if (!apiKey) {
          setIsApiKeyModalOpen(true);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        toast.error('Failed to initialize app. Please refresh the page.');
      }
    };
    
    initApp();
  }, []);
  
  const handlePromptSubmit = async (prompt: string) => {
    setIsLoading(true);
    try {
      // Get chat suggestions directly from OpenAI
      const suggestions = await getChatSuggestions(prompt);
      setSuggestionsContent(suggestions);
      
    } catch (error: any) {
      console.error('Error processing prompt:', error);
      toast.error(`Error: ${error.message || 'Failed to process your prompt'}`);
      setSuggestionsContent('');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={cartCount} onCartClick={() => {}} />
      
      <main className="flex-1 container py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-2">Gift Suggestion Assistant</h2>
          <p className="text-center text-muted-foreground mb-8">
            Ask me about gift ideas for any occasion, interest, or person
          </p>
          
          <PromptInput 
            onSubmit={handlePromptSubmit} 
            isLoading={isLoading}
          />
        </section>
        
        <section className="mb-12">
          <SuggestionDisplay 
            content={suggestionsContent}
            isLoading={isLoading}
          />
        </section>
      </main>
      
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={(valid) => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};

export default Index;
