// Session utility functions

export const getSessionId = (): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
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

  // Redirect to login page
  window.location.href = "/login";
};
