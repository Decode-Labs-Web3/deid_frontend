// Utility functions for request handling

export const generateRequestId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const apiPathName = (req: Request): string => {
  return new URL(req.url).pathname;
};
