
import { useState } from 'react';
import { validateOpenAIKey } from '@/services/openai';
import { testDatabaseConnection } from '@/services/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LucideVerified, LucideAlertCircle, LucideKey, LucideDatabase } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: (valid: boolean) => void;
}

const ApiKeyModal = ({ isOpen, onClose }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [dbUrl, setDbUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [dbValid, setDbValid] = useState<boolean | null>(null);

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an OpenAI API key');
      return;
    }
    
    if (!dbUrl.trim()) {
      toast.error('Please enter a PostgreSQL database URL');
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Validate OpenAI API Key
      const openaiValid = await validateOpenAIKey(apiKey);
      setApiKeyValid(openaiValid);
      
      if (!openaiValid) {
        toast.error('Invalid OpenAI API key. Please check and try again.');
        setIsValidating(false);
        return;
      }
      
      // Test database connection
      const dbConnection = await testDatabaseConnection(dbUrl);
      setDbValid(dbConnection);
      
      if (!dbConnection) {
        toast.error('Could not connect to PostgreSQL database. Please check your connection string.');
        setIsValidating(false);
        return;
      }
      
      // Both are valid
      toast.success('Credentials validated successfully');
      onClose(true);
    } catch (error) {
      console.error('Error during validation:', error);
      toast.error('Error validating credentials');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(!!(apiKeyValid && dbValid))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>API Credentials Required</span>
          </DialogTitle>
          <DialogDescription>
            To use the Gift Genius AI, we need your OpenAI API key and a PostgreSQL database connection.
            Your credentials will be stored locally in your browser and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <LucideKey className="h-4 w-4" />
                <span>OpenAI API Key</span>
              </div>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
                className="pr-10"
              />
              {apiKeyValid === true && (
                <LucideVerified className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
              )}
              {apiKeyValid === false && (
                <LucideAlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
              )}
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <LucideDatabase className="h-4 w-4" />
                <span>PostgreSQL Database URL</span>
              </div>
              <Input
                type="password"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                placeholder="postgresql://user:password@localhost:5432/dbname"
                className="pr-10"
              />
              {dbValid === true && (
                <LucideVerified className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
              )}
              {dbValid === false && (
                <LucideAlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
              )}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>You can get your OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI's dashboard</a>.</p>
            <p>Make sure your PostgreSQL server is running and accessible from your network.</p>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleValidate} disabled={isValidating}>
            {isValidating ? 'Validating...' : 'Validate Credentials'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
