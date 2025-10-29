/**
 * @title Error Classes
 * @description Custom error types for score system
 */

export class ScoreSystemError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ScoreSystemError";
  }
}

export class ValidationError extends ScoreSystemError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class IPFSError extends ScoreSystemError {
  constructor(message: string) {
    super(message, "IPFS_ERROR", 500);
    this.name = "IPFSError";
  }
}

export class ContractError extends ScoreSystemError {
  constructor(message: string) {
    super(message, "CONTRACT_ERROR", 500);
    this.name = "ContractError";
  }
}

export class SignatureError extends ScoreSystemError {
  constructor(message: string) {
    super(message, "SIGNATURE_ERROR", 401);
    this.name = "SignatureError";
  }
}

export class CooldownError extends ScoreSystemError {
  constructor(message: string, public remainingSeconds: number) {
    super(message, "COOLDOWN_ERROR", 429);
    this.name = "CooldownError";
  }
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: any) {
  if (error instanceof ScoreSystemError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  // Generic error
  return {
    success: false,
    error: error.message || "An unexpected error occurred",
    code: "INTERNAL_ERROR",
    statusCode: 500,
  };
}

/**
 * Log error with context
 */
export function logError(context: string, error: any, metadata?: any) {
  console.error(`❌ [${context}] Error:`, {
    message: error.message,
    name: error.name,
    code: error.code || "UNKNOWN",
    stack: error.stack,
    metadata,
  });
}
