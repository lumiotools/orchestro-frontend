export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  const fullUrl = `https://opn-intelligence-contract.onrender.com/${cleanPath}`
  console.log("API URL:", fullUrl) // Debug log
  return fullUrl
}

