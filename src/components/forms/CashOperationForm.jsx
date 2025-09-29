/**
 * Cash Operation Form Component
 * Form for creating and editing cash operations (deposits, withdrawals, etc.)
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCashOperationSchema } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/contexts/ToastContext";
import { formatCurrency } from "@/lib/utils";

export default function CashOperationForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) {
  const { success, error: showError } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createCashOperationSchema),
    defaultValues: {
      type: initialData?.type || "deposit",
      amount: initialData?.amount || "",
      currency: initialData?.currency || "PLN",
      time: initialData?.time ? new Date(initialData.time) : new Date(),
      comment: initialData?.comment || "",
      category: initialData?.category || "",
    },
  });

  const watchedType = watch("type");
  const watchedAmount = watch("amount");
  const watchedCurrency = watch("currency");

  const handleFormSubmit = async (data) => {
    try {
      let amount = parseFloat(data.amount);

      // For withdrawals and fees, ensure amount is negative
      if (data.type === "withdrawal" || data.type === "fee") {
        amount = Math.abs(amount) * -1;
      } else {
        // For deposits and dividends, ensure amount is positive
        amount = Math.abs(amount);
      }

      await onSubmit({
        ...data,
        amount,
      });

      success(
        initialData
          ? "Cash operation updated successfully!"
          : "Cash operation created successfully!"
      );
    } catch (error) {
      console.error("Form submission error:", error);
      showError(error.message || "Failed to save cash operation");
    }
  };

  const getOperationDescription = () => {
    const descriptions = {
      deposit: "Money added to your account",
      withdrawal: "Money removed from your account",
      dividend: "Dividend payment received",
      fee: "Fee or commission paid",
    };
    return descriptions[watchedType] || "";
  };

  const getAmountSign = () => {
    return watchedType === "deposit" || watchedType === "dividend" ? "+" : "-";
  };

  const getCategoryOptions = () => {
    const categoryOptions = {
      deposit: [
        { value: "transfer", label: "Bank Transfer" },
        { value: "initial", label: "Initial Deposit" },
        { value: "salary", label: "Salary" },
        { value: "bonus", label: "Bonus" },
        { value: "other", label: "Other" },
      ],
      withdrawal: [
        { value: "transfer", label: "Bank Transfer" },
        { value: "expenses", label: "Living Expenses" },
        { value: "investment", label: "Other Investment" },
        { value: "emergency", label: "Emergency" },
        { value: "other", label: "Other" },
      ],
      dividend: [
        { value: "stock", label: "Stock Dividend" },
        { value: "etf", label: "ETF Dividend" },
        { value: "fund", label: "Mutual Fund" },
        { value: "reit", label: "REIT" },
        { value: "other", label: "Other" },
      ],
      fee: [
        { value: "commission", label: "Trading Commission" },
        { value: "platform", label: "Platform Fee" },
        { value: "transaction", label: "Transaction Fee" },
        { value: "currency", label: "Currency Exchange" },
        { value: "withdrawal", label: "Withdrawal Fee" },
        { value: "other", label: "Other" },
      ],
    };

    return categoryOptions[watchedType] || [];
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Operation Type */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Operation Type *
        </label>
        <Select {...register("type")} error={!!errors.type}>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="dividend">Dividend</option>
          <option value="fee">Fee</option>
        </Select>
        {errors.type && (
          <p className="mt-1 text-sm text-error-600">{errors.type.message}</p>
        )}
        {watchedType && (
          <p className="mt-1 text-xs text-slate-500">
            {getOperationDescription()}
          </p>
        )}
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Amount *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span
                className={`text-sm ${
                  getAmountSign() === "+"
                    ? "text-success-600"
                    : "text-error-600"
                }`}
              >
                {getAmountSign()}
              </span>
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-8"
              error={!!errors.amount}
              {...register("amount")}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-error-600">
              {errors.amount.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Currency *
          </label>
          <Select {...register("currency")} error={!!errors.currency}>
            <option value="PLN">PLN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </Select>
          {errors.currency && (
            <p className="mt-1 text-sm text-error-600">
              {errors.currency.message}
            </p>
          )}
        </div>
      </div>

      {/* Amount Preview */}
      {watchedAmount && watchedCurrency && (
        <div className="bg-surface-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">
              {watchedType.charAt(0).toUpperCase() + watchedType.slice(1)}{" "}
              Amount:
            </span>
            <span
              className={`text-lg font-semibold ${
                getAmountSign() === "+" ? "text-success-600" : "text-error-600"
              }`}
            >
              {getAmountSign()}
              {formatCurrency(
                Math.abs(parseFloat(watchedAmount) || 0),
                watchedCurrency
              )}
            </span>
          </div>
        </div>
      )}

      {/* Date */}
      <div>
        <label
          htmlFor="time"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Date *
        </label>
        <DatePicker {...register("time")} error={!!errors.time} />
        {errors.time && (
          <p className="mt-1 text-sm text-error-600">{errors.time.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Category
        </label>
        <Select {...register("category")} error={!!errors.category}>
          <option value="">Select category (optional)</option>
          {getCategoryOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {errors.category && (
          <p className="mt-1 text-sm text-error-600">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Comment
        </label>
        <Textarea
          id="comment"
          rows={3}
          placeholder="Add any additional notes about this operation..."
          error={!!errors.comment}
          {...register("comment")}
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-error-600">
            {errors.comment.message}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-surface-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="min-w-32"
        >
          {isSubmitting || isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : initialData ? (
            "Update Operation"
          ) : (
            "Create Operation"
          )}
        </Button>
      </div>
    </form>
  );
}
