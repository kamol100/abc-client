import { LoginSchema } from "@/components/schema/login";

describe("LoginSchema", () => {
  it("accepts the valid auth payload used by E2E", () => {
    const parsed = LoginSchema.parse({
      host: "localhost",
      username: "kamol",
      password: "12345678",
    });

    expect(parsed).toEqual({
      host: "localhost",
      username: "kamol",
      password: "12345678",
    });
  });

  it("rejects too-short password", () => {
    const result = LoginSchema.safeParse({
      host: "localhost",
      username: "kamol",
      password: "123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "login.password.errors.required",
      );
    }
  });

  it("rejects empty username", () => {
    const result = LoginSchema.safeParse({
      host: "localhost",
      username: "",
      password: "12345678",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "login.username.errors.required",
      );
    }
  });
});
