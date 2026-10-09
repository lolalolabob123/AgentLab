
import { describe, it, expect } from "vitest";
import { isValidConnection } from "./validation";

describe("Behaviour tree connection validation", () => {
  it("rejects connections from a node to itself", () => {
    const connection = {
      source: "selector-1",
      target: "selector-1",
      sourceHandle: null,
      targetHandle: null,
    };

    const result = isValidConnection(connection, []);

    expect(result).toBe(false);
  });

  it("allows Root to connect to its first child", () => {
    const connection = {
        source: "root-1",
        target: "selector-1",
        sourceHandle: null,
        targetHandle: null,
    };

    const result = isValidConnection(connection, []);

    expect(result).toBe(true);
  });
});
