
import { useEffect, useState } from 'react';
import { CartItem as CartItemType } from '@/types';
import { getCart } from '@/services/database';
import {
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface CartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Cart = ({ open, onOpenChange }: CartProps) => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadCartItems();
    }
  }, [open]);
  
  const loadCartItems = async () => {
    setIsLoading(true);
    try {
      const items = await getCart();
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item.gift) return total;
      
      const price = item.gift.price;
      const discountedPrice = price * (1 - (item.gift.discountPercentage / 100));
      return total + discountedPrice;
    }, 0);
  };
  
  const handleCheckout = () => {
    toast.success('Checkout functionality would be implemented here');
    onOpenChange(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Your Cart
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 my-4">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8">
              <ShoppingBag className="h-12 w-12 mb-2 text-muted-foreground" />
              <h3 className="font-medium text-lg">Your cart is empty</h3>
              <p className="text-sm mt-1">Add some gifts to get started</p>
              <SheetClose asChild>
                <Button variant="outline" className="mt-4">
                  Continue Shopping
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map(item => (
                item.gift && (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b">
                    <img 
                      src={item.gift.thumbnail} 
                      alt={item.gift.title}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{item.gift.title}</h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-medium">
                          ${(item.gift.price * (1 - item.gift.discountPercentage / 100)).toFixed(2)}
                        </span>
                        {item.gift.discountPercentage > 0 && (
                          <span className="text-xs line-through text-muted-foreground">
                            ${item.gift.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                )
              ))}
            </div>
          )}
        </ScrollArea>
        
        {cartItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-muted-foreground">Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between text-lg font-medium">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            
            <SheetFooter className="mt-6">
              <Button className="w-full" onClick={handleCheckout}>
                Checkout
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
