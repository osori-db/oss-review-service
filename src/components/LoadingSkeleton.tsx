interface LoadingSkeletonProps {
  readonly rows?: number
}

export default function LoadingSkeleton({ rows = 5 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3 animate-pulse" role="status" aria-label="로딩 중">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/6" />
            <div className="ml-auto h-6 bg-gray-200 rounded-full w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
