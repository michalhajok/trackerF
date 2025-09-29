/**
 * Register Page
 * User registration page for new accounts
 */

import RegisterForm from "@/components/forms/RegisterForm";
import Link from "next/link";

export const metadata = {
  title: "Register",
  description: "Create your Portfolio Manager account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create your account
          </h1>
          <p className="text-slate-600">
            Get started with Portfolio Manager today
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-xl shadow-soft border border-surface-200 p-8">
          <RegisterForm />
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary-500 hover:text-primary-600 transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
