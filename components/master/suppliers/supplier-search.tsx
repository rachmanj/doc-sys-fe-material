import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

interface SearchParams {
  sap_code?: string;
  name?: string;
  type?: string;
  payment_project?: string;
}

interface SupplierSearchProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export default function SupplierSearch({
  onSearch,
  isLoading,
}: SupplierSearchProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleClear = () => {
    setSearchParams({});
    onSearch({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Input
            type="text"
            name="sap_code"
            placeholder="SAP Code"
            value={searchParams.sap_code || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
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
          <select
            name="type"
            value={searchParams.type || ""}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            disabled={isLoading}
          >
            <option value="">Select Type</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
        <div className="relative">
          <Input
            type="text"
            name="payment_project"
            placeholder="Payment Project"
            value={searchParams.payment_project || ""}
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
