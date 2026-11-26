import { describe, expect, it } from "vitest";
import { clientProfileAvatarSrc, staffProfileAvatarSrc } from "@/components/profiles/profile-avatar";

describe("staffProfileAvatarSrc", () => {
  // ব্যবহারকারীর প্রোফাইল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «builds the staff photo url when a photo is stored»।
  it("Profile avatar: builds the staff photo url when a photo is stored", () => {
    expect(
      staffProfileAvatarSrc({
        id: "staff-1",
        photo: "staffs/1/staff-1/photo/file.jpg",
      }),
    ).toBe("/api/staff-photo?v=staffs%2F1%2Fstaff-1%2Fphoto%2Ffile.jpg");
  });

  // ব্যবহারকারীর প্রোফাইল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «returns nothing when the staff has no photo»।
  it("Profile avatar: returns nothing when the staff has no photo", () => {
    expect(staffProfileAvatarSrc({ id: "staff-1", photo: null })).toBeUndefined();
    expect(staffProfileAvatarSrc({ id: "staff-1", photo: "  " })).toBeUndefined();
    expect(staffProfileAvatarSrc(null)).toBeUndefined();
  });
});

describe("clientProfileAvatarSrc", () => {
  // ব্যবহারকারীর প্রোফাইল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «builds the client photo url when a photo is stored»।
  it("Profile avatar: builds the client photo url when a photo is stored", () => {
    expect(clientProfileAvatarSrc("clients/3/client-1/photo/file.png")).toBe(
      "/api/client-photo?v=clients%2F3%2Fclient-1%2Fphoto%2Ffile.png",
    );
  });

  // ব্যবহারকারীর প্রোফাইল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «returns nothing when the client has no photo»।
  it("Profile avatar: returns nothing when the client has no photo", () => {
    expect(clientProfileAvatarSrc(null)).toBeUndefined();
    expect(clientProfileAvatarSrc("  ")).toBeUndefined();
    expect(clientProfileAvatarSrc(undefined)).toBeUndefined();
  });
});
