/**
 * Validation Schemas
 * Zod schemas for form validation
 */

import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password cannot exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Position schemas
export const createPositionSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol cannot exceed 10 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Symbol must contain only uppercase letters and numbers"
    ),
  name: z.string().max(100, "Name cannot exceed 100 characters").optional(),
  type: z.enum(["BUY", "SELL"], {
    required_error: "Position type is required",
  }),
  volume: z
    .number()
    .positive("Volume must be positive")
    .min(0.0001, "Volume must be at least 0.0001"),
  openPrice: z.number().positive("Open price must be positive"),
  openTime: z.date().refine((date) => date <= new Date(), {
    message: "Open time cannot be in the future",
  }),
  commission: z
    .number()
    .nonnegative("Commission must be non-negative")
    .optional()
    .default(0),
  taxes: z
    .number()
    .nonnegative("Taxes must be non-negative")
    .optional()
    .default(0),
  currency: z.enum(["USD", "EUR", "PLN", "GBP"]).optional().default("PLN"),
  exchange: z
    .string()
    .max(50, "Exchange name cannot exceed 50 characters")
    .optional(),
  sector: z.string().max(50, "Sector cannot exceed 50 characters").optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const updatePositionSchema = createPositionSchema.partial().extend({
  marketPrice: z.number().positive("Market price must be positive").optional(),
});

export const closePositionSchema = z.object({
  closePrice: z.number().positive("Close price must be positive"),
  closeTime: z
    .date()
    .optional()
    .default(() => new Date()),
});

// Cash Operation schemas
export const createCashOperationSchema = z.object({
  type: z.enum(["deposit", "withdrawal", "dividend", "fee"], {
    required_error: "Operation type is required",
  }),
  amount: z.number().refine((val) => val !== 0, {
    message: "Amount cannot be zero",
  }),
  currency: z.enum(["USD", "EUR", "PLN", "GBP"]).optional().default("PLN"),
  time: z.date().refine((date) => date <= new Date(), {
    message: "Operation time cannot be in the future",
  }),
  comment: z
    .string()
    .max(200, "Comment cannot exceed 200 characters")
    .optional(),
  category: z
    .string()
    .max(50, "Category cannot exceed 50 characters")
    .optional(),
});

// Pending Order schemas
export const createPendingOrderSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol cannot exceed 10 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Symbol must contain only uppercase letters and numbers"
    ),
  side: z.enum(["BUY", "SELL"], {
    required_error: "Order side is required",
  }),
  type: z.enum(["market", "limit", "stop", "stop_limit"], {
    required_error: "Order type is required",
  }),
  volume: z
    .number()
    .positive("Volume must be positive")
    .min(0.0001, "Volume must be at least 0.0001"),
  price: z.number().positive("Price must be positive").optional(),
  stopPrice: z.number().positive("Stop price must be positive").optional(),
  validUntil: z
    .date()
    .refine((date) => date > new Date(), {
      message: "Expiry date must be in the future",
    })
    .optional(),
  notes: z.string().max(200, "Notes cannot exceed 200 characters").optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select a file" })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size must be less than 10MB",
    })
    .refine(
      (file) =>
        [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
        ].includes(file.type),
      {
        message: "Only Excel (.xlsx, .xls) and CSV files are allowed",
      }
    ),
  importType: z.enum(["positions", "cash_operations", "orders"], {
    required_error: "Import type is required",
  }),
  skipFirstRow: z.boolean().optional().default(true),
});

// Settings schemas
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password cannot exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Search and filter schemas
export const positionFilterSchema = z
  .object({
    status: z.enum(["open", "closed", "all"]).optional(),
    symbol: z.string().optional(),
    type: z.enum(["BUY", "SELL"]).optional(),
    currency: z.enum(["USD", "EUR", "PLN", "GBP"]).optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    sortBy: z
      .enum(["openTime", "closeTime", "symbol", "grossPL"])
      .optional()
      .default("openTime"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    {
      message: "Date from must be before date to",
      path: ["dateTo"],
    }
  );

export const analyticsFilterSchema = z.object({
  period: z.enum(["1M", "3M", "6M", "1Y", "ALL"]).optional().default("1Y"),
  groupBy: z
    .enum(["symbol", "sector", "currency", "exchange", "type"])
    .optional()
    .default("symbol"),
});

// Export all schemas as a single object
export const schemas = {
  auth: {
    login: loginSchema,
    register: registerSchema,
  },
  position: {
    create: createPositionSchema,
    update: updatePositionSchema,
    close: closePositionSchema,
  },
  cashOperation: {
    create: createCashOperationSchema,
  },
  order: {
    create: createPendingOrderSchema,
  },
  file: {
    upload: fileUploadSchema,
  },
  settings: {
    profile: updateProfileSchema,
    password: changePasswordSchema,
  },
  filters: {
    positions: positionFilterSchema,
    analytics: analyticsFilterSchema,
  },
};
