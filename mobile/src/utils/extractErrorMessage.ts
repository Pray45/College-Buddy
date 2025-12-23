type MaybeError = {
  response?: {
    data?: any;
    status?: number;
    statusText?: string;
  };
  message?: string;
};


export function extractErrorMessage(error: MaybeError | string | null | undefined): string {
  const fallback = "Something went wrong. Please try again.";

  if (!error) return fallback;

  if (typeof error === "string") {
    return error;
  }

  const data = (error as MaybeError)?.response?.data;

  // Priority 1: backend-provided nested error message
  const nestedMessage = data?.error?.messege || data?.error?.message;
  if (typeof nestedMessage === "string" && nestedMessage.trim().length > 0) {
    return nestedMessage.trim();
  }

  // Priority 2: top-level message from backend
  const topLevelMessage = data?.messege || data?.message;
  if (typeof topLevelMessage === "string" && topLevelMessage.trim().length > 0) {
    return topLevelMessage.trim();
  }

  // Priority 3: raw string payload
  if (typeof data === "string" && data.trim().length > 0) {
    return data.trim();
  }

  // Priority 4: generic error message
  if (error.message) {
    return error.message;
  }

  // Priority 5: status text/code
  const statusLine = error?.response?.statusText || error?.response?.status;
  if (statusLine) {
    return String(statusLine);
  }

  return fallback;
}
