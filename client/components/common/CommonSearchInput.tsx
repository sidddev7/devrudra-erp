"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import debounce from "lodash/debounce";

const { Search } = Input;

interface CommonSearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  allowClear?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
  style?: React.CSSProperties;
  autoSearch?: boolean; // If true, searches automatically on change. If false, only on enter.
}

/**
 * Common search input component with debounced search
 * Supports both automatic search (on change) and manual search (on enter)
 * 
 * @param placeholder - Placeholder text for the search input
 * @param onSearch - Callback function called with search value
 * @param debounceMs - Debounce delay in milliseconds (default: 500)
 * @param allowClear - Show clear button (default: true)
 * @param size - Input size (default: "large")
 * @param className - Additional CSS classes
 * @param style - Additional inline styles
 * @param autoSearch - If true, searches automatically on change. If false, only on enter press (default: true)
 */
export const CommonSearchInput = ({
  placeholder = "Search...",
  onSearch,
  debounceMs = 500,
  allowClear = true,
  size = "large",
  className = "",
  style,
  autoSearch = true,
}: CommonSearchInputProps) => {
  const [searchValue, setSearchValue] = useState("");

  // Debounced search function for automatic search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  // Clear debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (autoSearch) {
      // If auto-search is enabled, use debounced search
      debouncedSearch(value);
    } else {
      // If auto-search is disabled, only search when cleared
      if (!value || value === "") {
        onSearch("");
      }
    }
  };

  const handleSearch = (value: string) => {
    // This is called on Enter press or button click
    setSearchValue(value);
    debouncedSearch.cancel(); // Cancel any pending debounced calls
    onSearch(value);
  };

  const handleClear = () => {
    setSearchValue("");
    debouncedSearch.cancel();
    onSearch("");
  };

  return (
    <Search
      placeholder={placeholder}
      allowClear={allowClear}
      enterButton={<SearchOutlined />}
      size={size}
      value={searchValue}
      onChange={handleChange}
      onSearch={handleSearch}
      className={className}
      style={style}
      onClear={handleClear}
    />
  );
};

