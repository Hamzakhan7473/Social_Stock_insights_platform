'use client'

export function SkeletonCard() {
  return (
    <div className="card-modern animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="card-modern animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-white/30 rounded w-24 mb-2"></div>
          <div className="h-8 bg-white/30 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-white/30 rounded-xl"></div>
      </div>
    </div>
  )
}

export function SkeletonTrendingTicker() {
  return (
    <div className="animate-pulse p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card-modern animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-3">
              <SkeletonTrendingTicker />
              <SkeletonTrendingTicker />
              <SkeletonTrendingTicker />
              <SkeletonTrendingTicker />
            </div>
          </div>
        </div>
        <div>
          <SkeletonCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

