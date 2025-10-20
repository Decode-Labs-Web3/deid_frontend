// Session utility functions

export const getSessionId = (): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");

  console.log("Cookies:", cookies);
  const sessionCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("deid_session_id=")
  );

  if (sessionCookie) {
    return sessionCookie.split("=")[1];
  }

  return null;
};

export const logout = (): void => {
  if (typeof document === "undefined") return;

  // Delete the session cookie
  document.cookie =
    "deid_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Clear session storage
  sessionStorage.removeItem("primaryWalletAddress");
  sessionStorage.removeItem("userRole");

  // Redirect to login page
  window.location.href = "/login";
};

export const switchToOtherAccount = (): void => {
  if (typeof document === "undefined") return;

  // Delete the session cookie
  document.cookie =
    "deid_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Clear session storage
  sessionStorage.removeItem("primaryWalletAddress");
  sessionStorage.removeItem("userRole");

  // Redirect to login page
  window.location.href = "/login";
};

export const getPrimaryWalletAddress = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("primaryWalletAddress");
};

// User role management
export const setUserRole = (role: string): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("userRole", role);
};

export const getUserRole = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("userRole");
};

export const isAdmin = (): boolean => {
  if (typeof window === "undefined") return false;
  const role = getUserRole();
  return role === "admin" || role === "super_admin";
};

export const clearUserRole = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("userRole");
};
