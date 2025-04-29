
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Settings, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getOpenAIKey } from '@/services/openai';
import ApiKeyModal from './ApiKeyModal';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

const Header = ({ cartCount, onCartClick }: HeaderProps) => {
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  
  const apiKey = getOpenAIKey();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Gift Genius AI</h1>
        </div>
        
        <nav className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsApiModalOpen(true)}
            title={apiKey ? "OpenAI API Key configured" : "Configure OpenAI API Key"}
            className="relative"
          >
            <Settings className="h-5 w-5" />
            {!apiKey && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onCartClick}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
              >
                {cartCount > 9 ? '9+' : cartCount}
              </Badge>
            )}
          </Button>
        </nav>
      </div>
      
      <ApiKeyModal 
        isOpen={isApiModalOpen}
        onClose={(valid) => setIsApiModalOpen(false)}
      />
    </header>
  );
};

export default Header;
