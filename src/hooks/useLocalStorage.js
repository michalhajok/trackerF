"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for localStorage with React state synchronization
 * Provides automatic serialization/deserialization and SSR safety
 */
export function useLocalStorage(key, initialValue) {
  // State to store the value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(
            `Error parsing localStorage value for key "${key}":`,
            error
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for storing user preferences
 */
export function useUserPreferences() {
  const [preferences, setPreferences, removePreferences] = useLocalStorage(
    "user_preferences",
    {
      theme: "light",
      language: "pl",
      currency: "PLN",
      itemsPerPage: 10,
      notifications: {
        email: true,
        push: false,
        sound: true,
      },
      dashboard: {
        showClosedPositions: true,
        defaultView: "cards",
      },
    }
  );

  const updatePreference = useCallback(
    (key, value) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setPreferences]
  );

  const updateNestedPreference = useCallback(
    (category, key, value) => {
      setPreferences((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
    },
    [setPreferences]
  );

  return {
    preferences,
    updatePreference,
    updateNestedPreference,
    removePreferences,
  };
}

/**
 * Hook for storing form draft data
 */
export function useFormDraft(formName) {
  const [draft, setDraft, removeDraft] = useLocalStorage(
    `form_draft_${formName}`,
    {}
  );

  const saveDraft = useCallback(
    (formData) => {
      setDraft({
        ...formData,
        savedAt: new Date().toISOString(),
      });
    },
    [setDraft]
  );

  const clearDraft = useCallback(() => {
    removeDraft();
  }, [removeDraft]);

  const hasDraft = Object.keys(draft).length > 0;

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft,
  };
}

export default useLocalStorage;
