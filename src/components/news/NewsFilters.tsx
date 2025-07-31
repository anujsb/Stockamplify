import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface Category {
  value: string;
  label: string;
  query?: string;
}

export function NewsFilters({
  categories = [],
  selectedCategory = '',
  onCategoryChange,
  onSearch,
  onRefresh,
  loading,
}: {
  categories?: Category[];
  selectedCategory?: string;
  onCategoryChange: (cat: string) => void;
  onSearch: (query: string) => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState('');
  const [localCategory, setLocalCategory] = useState(selectedCategory || (categories[0]?.value ?? ''));

  // Keep localCategory in sync with selectedCategory prop
  if (selectedCategory !== localCategory) {
    setLocalCategory(selectedCategory);
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
      <Select
        value={localCategory}
        onValueChange={val => {
          setLocalCategory(val);
          onCategoryChange(val);
        }}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(cat => (
            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="w-full md:w-80"
        placeholder="Search news..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSearch(search);
        }}
      />
      <Button
        variant="outline"
        onClick={() => onSearch(search)}
        disabled={loading}
      >
        Search
      </Button>
      <Button
        variant="ghost"
        onClick={onRefresh}
        disabled={loading}
        title="Refresh"
        className="ml-2"
      >
        <RefreshCw className={loading ? 'animate-spin' : ''} />
      </Button>
    </div>
  );
} 