import { describe, expect, it } from "vitest";
import UserFormSchema from "@/components/users/user-form-schema";
import { getUserFormSchema } from "@/components/users/user-type";

describe("UserFormSchema", () => {
  it("shows username on create and edit and omits roles", () => {
    for (const mode of ["create", "edit"] as const) {
      const fields = UserFormSchema({ mode });
      const names = fields.map((field) => field.name);

      expect(names).toContain("username");
      expect(names).not.toContain("roles_id");
      expect(fields.find((field) => field.name === "username")?.permission).toBeUndefined();
    }
  });

  it("accepts a username change without roles", () => {
    const parsed = getUserFormSchema("edit").parse({
      name: "Ada Lovelace",
      username: "ada",
      email: "ada@example.test",
      status: 1,
    });

    expect(parsed).toMatchObject({
      name: "Ada Lovelace",
      username: "ada",
      email: "ada@example.test",
      status: 1,
    });
    expect(parsed).not.toHaveProperty("roles_id");
  });
});
