/**
 * Position Form Component
 * Form for creating and editing trading positions
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPositionSchema } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { useToast } from "@/contexts/ToastContext";

export default function PositionForm({
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
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      symbol: initialData?.symbol || "",
      name: initialData?.name || "",
      type: initialData?.type || "BUY",
      volume: initialData?.volume || "",
      openPrice: initialData?.openPrice || "",
      openTime: initialData?.openTime
        ? new Date(initialData.openTime)
        : new Date(),
      commission: initialData?.commission || 0,
      taxes: initialData?.taxes || 0,
      currency: initialData?.currency || "PLN",
      exchange: initialData?.exchange || "",
      sector: initialData?.sector || "",
      notes: initialData?.notes || "",
    },
  });

  const watchedType = watch("type");
  const watchedVolume = watch("volume");
  const watchedPrice = watch("openPrice");

  const calculateTotalValue = () => {
    const volume = parseFloat(watchedVolume) || 0;
    const price = parseFloat(watchedPrice) || 0;
    return volume * price;
  };

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit({
        ...data,
        volume: parseFloat(data.volume),
        openPrice: parseFloat(data.openPrice),
        commission: parseFloat(data.commission) || 0,
        taxes: parseFloat(data.taxes) || 0,
      });

      success(
        initialData
          ? "Position updated successfully!"
          : "Position created successfully!"
      );
    } catch (error) {
      console.error("Form submission error:", error);
      showError(error.message || "Failed to save position");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Symbol and Name */}
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
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Company Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Apple Inc."
            error={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
          )}
        </div>
      </div>

      {/* Type and Volume */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Position Type *
          </label>
          <Select {...register("type")} error={!!errors.type}>
            <option value="BUY">BUY (Long)</option>
            <option value="SELL">SELL (Short)</option>
          </Select>
          {errors.type && (
            <p className="mt-1 text-sm text-error-600">{errors.type.message}</p>
          )}
        </div>

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
            <p className="mt-1 text-sm text-error-600">
              {errors.volume.message}
            </p>
          )}
        </div>
      </div>

      {/* Price and Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="openPrice"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Open Price *
          </label>
          <Input
            id="openPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="150.00"
            error={!!errors.openPrice}
            {...register("openPrice")}
          />
          {errors.openPrice && (
            <p className="mt-1 text-sm text-error-600">
              {errors.openPrice.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="openTime"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Open Date *
          </label>
          <DatePicker {...register("openTime")} error={!!errors.openTime} />
          {errors.openTime && (
            <p className="mt-1 text-sm text-error-600">
              {errors.openTime.message}
            </p>
          )}
        </div>
      </div>

      {/* Total Value Display */}
      {watchedVolume && watchedPrice && (
        <div className="bg-surface-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">
              Total Value:
            </span>
            <span className="text-lg font-semibold text-slate-900">
              ${calculateTotalValue().toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Commission and Taxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="commission"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Commission
          </label>
          <Input
            id="commission"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={!!errors.commission}
            {...register("commission")}
          />
          {errors.commission && (
            <p className="mt-1 text-sm text-error-600">
              {errors.commission.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="taxes"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Taxes
          </label>
          <Input
            id="taxes"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={!!errors.taxes}
            {...register("taxes")}
          />
          {errors.taxes && (
            <p className="mt-1 text-sm text-error-600">
              {errors.taxes.message}
            </p>
          )}
        </div>
      </div>

      {/* Currency and Exchange */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Currency
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

        <div>
          <label
            htmlFor="exchange"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Exchange
          </label>
          <Input
            id="exchange"
            type="text"
            placeholder="e.g., NASDAQ, NYSE"
            error={!!errors.exchange}
            {...register("exchange")}
          />
          {errors.exchange && (
            <p className="mt-1 text-sm text-error-600">
              {errors.exchange.message}
            </p>
          )}
        </div>
      </div>

      {/* Sector */}
      <div>
        <label
          htmlFor="sector"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Sector
        </label>
        <Input
          id="sector"
          type="text"
          placeholder="e.g., Technology, Healthcare"
          error={!!errors.sector}
          {...register("sector")}
        />
        {errors.sector && (
          <p className="mt-1 text-sm text-error-600">{errors.sector.message}</p>
        )}
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
          placeholder="Add any additional notes about this position..."
          error={!!errors.notes}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-error-600">{errors.notes.message}</p>
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
            "Update Position"
          ) : (
            "Create Position"
          )}
        </Button>
      </div>
    </form>
  );
}
