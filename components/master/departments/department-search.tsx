import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

interface SearchParams {
  name?: string;
  project?: string;
  akronim?: string;
}

interface DepartmentSearchProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export default function DepartmentSearch({
  onSearch,
  isLoading,
}: DepartmentSearchProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleClear = () => {
    setSearchParams({});
    onSearch({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newParams = { ...searchParams, [name]: value };

    // Remove empty params
    Object.keys(newParams).forEach(
      (key) =>
        !newParams[key as keyof SearchParams] &&
        delete newParams[key as keyof SearchParams]
    );

    setSearchParams(newParams);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        <div className="relative">
          <Input
            type="text"
            name="name"
            placeholder="Name"
            value={searchParams.name || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="relative">
          <Input
            type="text"
            name="project"
            placeholder="Project"
            value={searchParams.project || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="relative">
          <Input
            type="text"
            name="akronim"
            placeholder="Acronym"
            value={searchParams.akronim || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          <SearchIcon className="w-4 h-4 mr-2" />
          Search
        </Button>
        {Object.keys(searchParams).length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}
