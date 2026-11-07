import { describe, expect, it } from "vitest";
import { DemoRequestAdminEditFormSchema } from "@/components/demo-requests/demo-request-type";
import { buildDemoRequestSchema } from "@/lib/validations/demo-request-schema";

const schema = buildDemoRequestSchema((key) => key);

const valid = {
  full_name: "Jane Doe",
  isp_name: "Example Networks",
  email: "",
  website: "",
  phone: "01712345678",
  user_count: "",
  whatsapp: "01712345678",
  office_address: "",
  terms_accepted: true,
};

describe("buildDemoRequestSchema website", () => {
  it("accepts a website that is not a url", () => {
    const result = schema.safeParse({ ...valid, website: "example.isptik.com" });

    expect(result.success).toBe(true);
  });

  it("accepts an empty website", () => {
    const result = schema.safeParse(valid);

    expect(result.success).toBe(true);
  });
});

const adminEdit = {
  full_name: "Jane Doe",
  isp_name: "Example Networks",
  email: "",
  website: "example.isptik.com",
  phone: "01712345678",
  user_count: "",
  whatsapp: "01712345678",
  office_address: "",
  terms_accepted: true,
  status: "approved" as const,
  username: "demo.user",
  password: "demo-pass",
};

describe("DemoRequestAdminEditFormSchema", () => {
  it("accepts every fillable field, including username and password", () => {
    const result = DemoRequestAdminEditFormSchema.safeParse(adminEdit);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe("demo.user");
      expect(result.data.password).toBe("demo-pass");
    }
  });

  it("accepts empty username and password", () => {
    const result = DemoRequestAdminEditFormSchema.safeParse({
      ...adminEdit,
      username: "",
      password: "",
    });

    expect(result.success).toBe(true);
  });
});
