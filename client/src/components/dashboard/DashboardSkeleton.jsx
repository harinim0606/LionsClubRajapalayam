// DashboardSkeleton – loading skeletons for all three sections

const Pulse = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

export const ClubInfoSkeleton = () => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
    {/* Banner */}
    <div className="h-28 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse" />
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Pulse key={i} className="h-20" />)}
      </div>
      {/* Leadership */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <Pulse key={i} className="h-14" />)}
      </div>
      {/* Info rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => <Pulse key={i} className="h-12" />)}
      </div>
    </div>
  </div>
);

export const CardGridSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1 bg-gray-100" />
        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            <Pulse className="w-14 h-14 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-3/4" />
              <Pulse className="h-3 w-1/2" />
              <Pulse className="h-3 w-1/3" />
            </div>
          </div>
          <div className="flex gap-2">
            <Pulse className="flex-1 h-8 rounded-xl" />
            <Pulse className="flex-1 h-8 rounded-xl" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
