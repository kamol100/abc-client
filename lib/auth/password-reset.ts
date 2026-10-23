export const EMAIL_NOT_FOUND_MESSAGE =
  "Email not found to reset password. Please contact your administrator.";

export const FORGOT_PASSWORD_PATH = "/auth/forgot-password";
export const RESET_PASSWORD_PATH = "/auth/reset-password";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function publicApiSucceeded(body: unknown): boolean {
  return isRecord(body) && body.success === true;
}

export function publicApiDataMessage(body: unknown): string | null {
  if (!isRecord(body) || typeof body.data !== "string") return null;
  return body.data.trim() === "" ? null : body.data;
}

export function publicApiMessage(body: unknown, fallback: string): string {
  if (!isRecord(body)) return fallback;
  if (typeof body.error === "string" && body.error.trim() !== "") return body.error;

  if (isRecord(body.errors)) {
    for (const value of Object.values(body.errors)) {
      if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim() !== "") {
        return value[0];
      }
    }
  }

  if (typeof body.message === "string" && body.message.trim() !== "") return body.message;
  return fallback;
}
