/**
 * Order Form Component
 * Form for creating and editing pending orders
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPendingOrderSchema } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { Checkbox } from "@/components/ui/Checkbox";
import { useToast } from "@/contexts/ToastContext";
import { formatCurrency } from "@/lib/utils";

export default function OrderForm({
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
    resolver: zodResolver(createPendingOrderSchema),
    defaultValues: {
      symbol: initialData?.symbol || "",
      side: initialData?.side || "BUY",
      type: initialData?.type || "market",
      volume: initialData?.volume || "",
      price: initialData?.price || "",
      stopPrice: initialData?.stopPrice || "",
      validUntil: initialData?.validUntil
        ? new Date(initialData.validUntil)
        : undefined,
      notes: initialData?.notes || "",
    },
  });

  const watchedSide = watch("side");
  const watchedType = watch("type");
  const watchedVolume = watch("volume");
  const watchedPrice = watch("price");

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit({
        ...data,
        volume: parseFloat(data.volume),
        price: data.price ? parseFloat(data.price) : undefined,
        stopPrice: data.stopPrice ? parseFloat(data.stopPrice) : undefined,
      });

      success(
        initialData
          ? "Order updated successfully!"
          : "Order created successfully!"
      );
    } catch (error) {
      console.error("Form submission error:", error);
      showError(error.message || "Failed to save order");
    }
  };

  const calculateOrderValue = () => {
    const volume = parseFloat(watchedVolume) || 0;
    const price = parseFloat(watchedPrice) || 0;
    return volume * price;
  };

  const getOrderTypeDescription = () => {
    const descriptions = {
      market: "Execute immediately at the best available price",
      limit: "Execute only at the specified price or better",
      stop: "Execute market order when price reaches stop level",
      stop_limit: "Execute limit order when price reaches stop level",
    };
    return descriptions[watchedType] || "";
  };

  const showPriceField =
    watchedType === "limit" || watchedType === "stop_limit";
  const showStopPriceField =
    watchedType === "stop" || watchedType === "stop_limit";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Symbol and Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="symbol"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Symbol *
          </label>
          <Input
            id="symbol"
            type="text"
            placeholder="e.g., AAPL, MSFT"
            className="uppercase"
            error={!!errors.symbol}
            {...register("symbol")}
          />
          {errors.symbol && (
            <p className="mt-1 text-sm text-error-600">
              {errors.symbol.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="side"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Order Side *
          </label>
          <Select {...register("side")} error={!!errors.side}>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </Select>
          {errors.side && (
            <p className="mt-1 text-sm text-error-600">{errors.side.message}</p>
          )}
        </div>
      </div>

      {/* Order Type */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Order Type *
        </label>
        <Select {...register("type")} error={!!errors.type}>
          <option value="market">Market Order</option>
          <option value="limit">Limit Order</option>
          <option value="stop">Stop Order</option>
          <option value="stop_limit">Stop Limit Order</option>
        </Select>
        {errors.type && (
          <p className="mt-1 text-sm text-error-600">{errors.type.message}</p>
        )}
        {watchedType && (
          <p className="mt-1 text-xs text-slate-500">
            {getOrderTypeDescription()}
          </p>
        )}
      </div>

      {/* Volume */}
      <div>
        <label
          htmlFor="volume"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Volume *
        </label>
        <Input
          id="volume"
          type="number"
          step="0.0001"
          min="0"
          placeholder="100"
          error={!!errors.volume}
          {...register("volume")}
        />
        {errors.volume && (
          <p className="mt-1 text-sm text-error-600">{errors.volume.message}</p>
        )}
      </div>

      {/* Price Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showPriceField && (
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              {watchedType === "limit" ? "Limit Price *" : "Limit Price"}
            </label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="150.00"
              error={!!errors.price}
              {...register("price")}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-error-600">
                {errors.price.message}
              </p>
            )}
          </div>
        )}

        {showStopPriceField && (
          <div>
            <label
              htmlFor="stopPrice"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Stop Price *
            </label>
            <Input
              id="stopPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="145.00"
              error={!!errors.stopPrice}
              {...register("stopPrice")}
            />
            {errors.stopPrice && (
              <p className="mt-1 text-sm text-error-600">
                {errors.stopPrice.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Order Value Preview */}
      {watchedVolume && watchedPrice && showPriceField && (
        <div className="bg-surface-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">
              Estimated Order Value:
            </span>
            <span className="text-lg font-semibold text-slate-900">
              ${calculateOrderValue().toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary-900 mb-2">
          Order Summary
        </h4>
        <div className="text-sm text-primary-800 space-y-1">
          <p>
            <span className="font-medium">{watchedSide}</span>{" "}
            {watchedVolume || "0"} shares of{" "}
            <span className="font-medium uppercase">
              {watch("symbol") || "SYMBOL"}
            </span>
          </p>
          <p>
            Order Type:{" "}
            <span className="font-medium">
              {watchedType?.replace("_", " ").toUpperCase() || "MARKET"}
            </span>
          </p>
          {showPriceField && watchedPrice && (
            <p>
              Price: <span className="font-medium">${watchedPrice}</span>
            </p>
          )}
          {showStopPriceField && watch("stopPrice") && (
            <p>
              Stop Price:{" "}
              <span className="font-medium">${watch("stopPrice")}</span>
            </p>
          )}
        </div>
      </div>

      {/* Valid Until */}
      <div>
        <label
          htmlFor="validUntil"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Valid Until
        </label>
        <DatePicker
          {...register("validUntil")}
          error={!!errors.validUntil}
          showTime
        />
        {errors.validUntil && (
          <p className="mt-1 text-sm text-error-600">
            {errors.validUntil.message}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          Leave empty for Good Till Cancelled (GTC) orders
        </p>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Notes
        </label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Add any additional notes about this order..."
          error={!!errors.notes}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-error-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Risk Warning */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-warning-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-warning-800">
              Trading Risk Warning
            </h3>
            <div className="mt-2 text-sm text-warning-700">
              <p>
                Trading involves substantial risk of loss. Please ensure you
                understand the risks before placing this order.
              </p>
            </div>
          </div>
        </div>
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
              Placing Order...
            </>
          ) : initialData ? (
            "Update Order"
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </form>
  );
}
