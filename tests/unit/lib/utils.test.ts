import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges truthy classes and drops falsy values", () => {
    const classes = cn("px-4", false && "hidden", undefined, "text-sm");

    expect(classes).toBe("px-4 text-sm");
  });

  it("resolves tailwind conflicts with latest utility", () => {
    const classes = cn("p-2", "p-4", "text-muted-foreground", "text-foreground");

    expect(classes).toBe("p-4 text-foreground");
  });
});
