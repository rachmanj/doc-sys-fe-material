"use client";

import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Stack from "@mui/material/Stack";

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
    <Box component="form" onSubmit={handleSubmit}>
      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          type="search"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ minWidth: "100px" }}
        >
          Search
        </Button>
        {searchQuery && (
          <Button
            type="button"
            variant="outlined"
            onClick={handleClear}
            disabled={isLoading}
            sx={{ minWidth: "100px" }}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Box>
  );
}
