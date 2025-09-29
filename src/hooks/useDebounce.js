"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook that debounces a value
 * Useful for search inputs, API calls, etc.
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that debounces a callback function
 * Useful for API calls that should be debounced
 */
export function useDebouncedCallback(callback, delay = 500, deps = []) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, ...deps]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cancel pending calls
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return [debouncedCallback, cancel];
}

/**
 * Hook for debounced search functionality
 */
export function useDebouncedSearch(initialQuery = "", delay = 500) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);

    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [query, delay]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setIsSearching(false);
  }, []);

  return {
    query,
    debouncedQuery,
    setQuery,
    clearSearch,
    isSearching,
  };
}

/**
 * Hook for debounced form validation
 */
export function useDebouncedValidation(values, validationFn, delay = 300) {
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setIsValidating(true);

    const handler = setTimeout(async () => {
      try {
        const validationErrors = await validationFn(values);
        setErrors(validationErrors || {});
      } catch (error) {
        console.error("Validation error:", error);
      } finally {
        setIsValidating(false);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [values, validationFn, delay]);

  return { errors, isValidating };
}

export default useDebounce;
