import { describe, expect, it } from "vitest";
import { staffProfileAvatarSrc } from "@/components/profiles/profile-avatar";

describe("staffProfileAvatarSrc", () => {
  it("builds the staff photo url when a photo is stored", () => {
    expect(
      staffProfileAvatarSrc({
        id: "staff-1",
        photo: "staffs/1/staff-1/photo/file.jpg",
      }),
    ).toBe("/api/staffs/staff-1/images/photo?v=staffs%2F1%2Fstaff-1%2Fphoto%2Ffile.jpg");
  });

  it("returns nothing when the staff has no photo", () => {
    expect(staffProfileAvatarSrc({ id: "staff-1", photo: null })).toBeUndefined();
    expect(staffProfileAvatarSrc({ id: "staff-1", photo: "  " })).toBeUndefined();
    expect(staffProfileAvatarSrc(null)).toBeUndefined();
  });
});
