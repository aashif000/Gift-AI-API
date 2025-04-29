
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput = ({ onSubmit, isLoading }: PromptInputProps) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const examplePrompts = [
    'What are good gift ideas for someone who likes programming?',
    'Suggest birthday gifts for a 12-year-old boy who loves sports',
    'Ideas for a graduation gift under $50'
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask me for gift ideas or recommendations..."
            className="prompt-input min-h-24 resize-none"
            disabled={isLoading}
          />
          <div className="text-xs text-muted-foreground">
            Try asking about gift ideas for specific interests, occasions, or age groups
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>

          <Button type="submit" disabled={isLoading || !prompt.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Get Suggestions
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;
