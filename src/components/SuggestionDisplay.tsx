
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

interface SuggestionDisplayProps {
  content: string;
  isLoading: boolean;
}

const SuggestionDisplay = ({ content, isLoading }: SuggestionDisplayProps) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Ask a question above to get gift suggestions
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
          {content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
};

export default SuggestionDisplay;
