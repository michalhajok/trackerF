// src/components/ui/SkeletonLoader.jsx - MISSING!
export function SkeletonLoader({ type = "card", count = 1 }) {
  const skeletons = {
    card: () => (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    ),
    table: () => (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    ),
  };

  return (
    <div>
      {[...Array(count)].map((_, i) => (
        <div key={i}>{skeletons[type]()}</div>
      ))}
    </div>
  );
}
