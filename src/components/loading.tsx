interface LoadingProps {
  message?: string
  size?: "small" | "medium" | "large"
}

export default function Loading({ message = "Loading...", size = "medium" }: LoadingProps) {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-2",
    large: "h-12 w-12 border-t-2 border-b-2",
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-purple-600 mb-3`}
        role="status"
        aria-label="Loading"
      ></div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}
