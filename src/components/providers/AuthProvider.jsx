/**
 * Authentication Provider Component
 * Individual provider for authentication context
 */

"use client";

import { AuthProvider as AuthContextProvider } from "@/contexts/AuthContext";

export default function AuthProvider({ children }) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
