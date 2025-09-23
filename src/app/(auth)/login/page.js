/**
 * Login Page
 * Authentication page for user login (JavaScript only)
 */

import LoginForm from "@/components/forms/LoginForm";
import Link from "next/link";

export const metadata = {
  title: "Login",
  description: "Sign in to your Portfolio Manager account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back
          </h1>
          <p className="text-slate-600">
            Sign in to your Portfolio Manager account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-soft border border-surface-200 p-8">
          <LoginForm />
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-slate-600">
            Dont have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary-500 hover:text-primary-600 transition-colors duration-200"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
