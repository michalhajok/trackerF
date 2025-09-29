import { cn } from "@/lib/utils";

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-100", className)}
      {...props}
    />
  );
};

const SkeletonText = ({ lines = 3, className }) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 w-full",
            i === lines - 1 && "w-2/3" // Last line shorter
          )}
        />
      ))}
    </div>
  );
};

const SkeletonCard = ({ className }) => {
  return (
    <div className={cn("p-6 border border-gray-200 rounded-lg", className)}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <SkeletonText lines={3} />
        <div className="flex justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
};

const SkeletonTable = ({ rows = 5, columns = 4, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                "h-4 flex-1",
                colIndex === 0 && "w-16", // First column narrower
                colIndex === columns - 1 && "w-24" // Last column specific width
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const SkeletonAvatar = ({ size = "md", className }) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return <Skeleton className={cn("rounded-full", sizes[size], className)} />;
};

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar };
export default Skeleton;
