import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

interface UserSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function UserSearch({ onSearch, isLoading }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        Search
      </Button>
      {searchQuery && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          disabled={isLoading}
        >
          Clear
        </Button>
      )}
    </form>
  );
}
