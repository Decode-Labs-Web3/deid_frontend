// Session management utilities

export const getSessionId = (): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const sessionCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("deid_session_id=")
  );

  return sessionCookie ? sessionCookie.split("=")[1] : null;
};

export const deleteSessionId = (): void => {
  if (typeof document === "undefined") return;

  // Delete the cookie by setting it to expire in the past
  document.cookie =
    "deid_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const setSessionId = (sessionId: string): void => {
  if (typeof document === "undefined") return;

  // Set cookie with 7 days expiration
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);

  document.cookie = `deid_session_id=${sessionId}; expires=${expirationDate.toUTCString()}; path=/;`;
};

export const logout = (): void => {
  deleteSessionId();
  // Redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};
