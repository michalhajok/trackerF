import { cn } from "@/lib/utils";

const LoadingSpinner = ({
  size = "md",
  className,
  color = "primary",
  ...props
}) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colors = {
    primary: "text-primary-500",
    white: "text-white",
    gray: "text-gray-500",
    current: "text-current",
  };

  return (
    <svg
      className={cn("animate-spin", sizes[size], colors[color], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

const LoadingCard = ({ title = "Ładowanie...", className }) => (
  <div className={cn("flex items-center justify-center p-8", className)}>
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600">{title}</p>
    </div>
  </div>
);

const LoadingOverlay = ({ isLoading, children, className }) => {
  if (!isLoading) return children;

  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 bg-white/75 flex items-center justify-center rounded-lg">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
};

const LoadingButton = ({ loading, children, ...props }) => (
  <button disabled={loading} {...props}>
    {loading && <LoadingSpinner size="sm" className="mr-2" color="current" />}
    {children}
  </button>
);

export { LoadingSpinner, LoadingCard, LoadingOverlay, LoadingButton };
export default LoadingSpinner;
