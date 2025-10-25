/**
 * Backend API utility functions
 * Handles authentication, session management, and error handling
 */

import { toastError } from "./toast.utils";

/**
 * Deletes the session cookie and redirects to login
 */
export function handleUnauthorized() {
  console.log("🔒 Unauthorized - Logging out user");

  // Delete the deid_session_id cookie
  document.cookie =
    "deid_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Clear session storage
  sessionStorage.clear();

  // Show error message
  toastError("Session expired. Please log in again.");

  // Redirect to login page
  setTimeout(() => {
    window.location.href = "/login";
  }, 1000);
}

/**
 * Makes an authenticated request to the backend API
 * Automatically handles 401 errors and logs out the user
 *
 * @param endpoint - API endpoint (e.g., "/api/v1/task/123/validate")
 * @param options - Fetch options
 * @returns Promise with the response
 */
export async function backendFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const backendUrl = process.env.DEID_AUTH_BACKEND || "http://localhost:8000";
  const url = `${backendUrl}${endpoint}`;

  console.log(`🌐 Backend API: ${options.method || "GET"} ${endpoint}`);

  try {
    // Always include credentials for session cookies
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.error("❌ 401 Unauthorized - Session expired");
      handleUnauthorized();
      throw new Error("Unauthorized - Session expired");
    }

    return response;
  } catch (error) {
    console.error(`❌ Backend API error:`, error);
    throw error;
  }
}

/**
 * Makes an authenticated JSON request to the backend API
 * Automatically parses JSON response and handles errors
 *
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @returns Promise with parsed JSON data
 */
export async function backendFetchJSON<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await backendFetch(endpoint, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(
      errorData.message || `Request failed: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * POST request helper
 */
export async function backendPost<T = any>(
  endpoint: string,
  body?: any
): Promise<T> {
  return backendFetchJSON<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * GET request helper
 */
export async function backendGet<T = any>(endpoint: string): Promise<T> {
  return backendFetchJSON<T>(endpoint, {
    method: "GET",
  });
}

/**
 * PUT request helper
 */
export async function backendPut<T = any>(
  endpoint: string,
  body?: any
): Promise<T> {
  return backendFetchJSON<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function backendDelete<T = any>(endpoint: string): Promise<T> {
  return backendFetchJSON<T>(endpoint, {
    method: "DELETE",
  });
}
