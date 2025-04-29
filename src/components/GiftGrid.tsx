
import { Gift } from '@/types';
import GiftCard from './GiftCard';
import { Skeleton } from '@/components/ui/skeleton';

interface GiftGridProps {
  gifts: Gift[];
  isLoading: boolean;
  onAddToCart: (giftId: number) => void;
  cartItemIds: Set<number>;
}

const GiftGrid = ({ gifts, isLoading, onAddToCart, cartItemIds }: GiftGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="flex flex-col h-full">
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (gifts.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-medium text-muted-foreground mb-2">No gift suggestions found</h3>
        <p className="text-muted-foreground">Try a different search query or prompt.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {gifts.map((gift) => (
        <GiftCard 
          key={gift.id} 
          gift={gift} 
          onAddToCart={onAddToCart}
          isInCart={cartItemIds.has(gift.id)}
        />
      ))}
    </div>
  );
};

export default GiftGrid;
