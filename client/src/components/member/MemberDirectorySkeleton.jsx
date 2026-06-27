const MemberDirectorySkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-72"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
      </div>

      {/* Search & Filters Section Skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
          <div className="h-12 bg-gray-200 rounded-xl w-full md:w-32"></div>
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gray-200 rounded-full shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-xl w-full pt-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberDirectorySkeleton;
