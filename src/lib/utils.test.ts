import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("skips falsy values", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });

  it("resolves conflicting tailwind classes in favour of the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("supports conditional object and array syntax", () => {
    expect(cn(["flex", { "sr-only": false, "gap-2": true }])).toBe(
      "flex gap-2",
    );
  });

  it("keeps the last display utility when several are given", () => {
    expect(cn("flex", "block")).toBe("block");
  });
});
