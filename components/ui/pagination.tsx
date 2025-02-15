"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  links: PaginationLink[];
  onPageChange: (page: number) => void;
  perPage: number;
  total: number;
  from: number;
  to: number;
}

export default function Pagination({
  currentPage,
  lastPage,
  links,
  onPageChange,
  perPage,
  total,
  from,
  to,
}: PaginationProps) {
  const displayLinks = links.filter(
    (link) => !link.label.includes("Previous") && !link.label.includes("Next")
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex-1 text-sm text-gray-700">
        Showing <span className="font-medium">{from}</span> to{" "}
        <span className="font-medium">{to}</span> of{" "}
        <span className="font-medium">{total}</span> results
      </div>

      <div className="flex items-center mt-2 sm:mt-0">
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-500 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center">
          {displayLinks.map((link, index) => {
            // Handle ellipsis
            if (link.label === "...") {
              return (
                <span key={index} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              );
            }

            return (
              <button
                key={index}
                onClick={() => onPageChange(parseInt(link.label))}
                className={`px-3 py-2 text-sm rounded-md mx-1 ${
                  link.active
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() =>
            currentPage < lastPage && onPageChange(currentPage + 1)
          }
          disabled={currentPage === lastPage}
          className="p-2 text-gray-500 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
