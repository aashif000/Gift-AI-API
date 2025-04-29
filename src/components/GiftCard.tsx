
import { Gift } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Star, ShoppingCart, Check } from 'lucide-react';

interface GiftCardProps {
  gift: Gift;
  onAddToCart: (giftId: number) => void;
  isInCart: boolean;
}

const GiftCard = ({ gift, onAddToCart, isInCart }: GiftCardProps) => {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(gift.id);
    setTimeout(() => setIsAdding(false), 1000);
  };
  
  const discountedPrice = gift.price * (1 - gift.discountPercentage / 100);
  
  return (
    <Card className="gift-card overflow-hidden flex flex-col h-full">
      <div className="relative h-48">
        <img 
          src={gift.thumbnail} 
          alt={gift.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white text-gray-800">
            {gift.category}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{gift.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" /> 
            {gift.rating}
          </span>
          <span className="mx-2">•</span>
          <span>{gift.brand}</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {gift.description}
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium">${discountedPrice.toFixed(2)}</span>
          {gift.discountPercentage > 0 && (
            <span className="text-sm line-through text-muted-foreground">
              ${gift.price.toFixed(2)}
            </span>
          )}
          {gift.discountPercentage > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {gift.discountPercentage.toFixed(0)}% OFF
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAddToCart}
          disabled={isInCart || isAdding}
          className="w-full gap-2"
          variant={isInCart ? "secondary" : "default"}
        >
          {isInCart ? (
            <>
              <Check className="h-4 w-4" /> In Cart
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GiftCard;
