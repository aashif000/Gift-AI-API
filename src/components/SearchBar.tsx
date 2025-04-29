
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (search: string) => void;
  disabled?: boolean;
}

const SearchBar = ({ onSearch, disabled = false }: SearchBarProps) => {
  const [search, setSearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search);
  };

  const clearSearch = () => {
    setSearch('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full max-w-md">
      <Input
        type="text"
        placeholder="Search gifts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pr-10"
        disabled={disabled}
      />
      {search && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
      <Button 
        type="submit" 
        disabled={disabled || !search.trim()} 
        className="ml-2"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
};

export default SearchBar;
