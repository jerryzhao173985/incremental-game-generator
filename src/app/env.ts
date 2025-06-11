// Environment variable validation and typing
export const env = {
  // Add any environment variables needed for production
  // For now, we're using client-side API key handling as specified in the requirements
  NODE_ENV: process.env.NODE_ENV || "development",
  VERCEL_URL: process.env.VERCEL_URL || "",
  VERCEL_ENV: process.env.VERCEL_ENV || "development",
}

// Function to get the base URL for the application
export function getBaseUrl() {
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`
  }

  // Default to localhost for development
  return "http://localhost:3000"
}
