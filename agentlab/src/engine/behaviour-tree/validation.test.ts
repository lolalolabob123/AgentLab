
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

  it("rejects a second child connected to Root", () => {
    const existingEdge = [
      {
        id: "root-selector",
        source: "root-1",
        target: "selector-1",
      },
    ];

    const connection = {
      source: "root-1",
      target: "sequence-1",
      sourceHandle: null,
      targetHandle: null,
    };

    const result = isValidConnection(connection, existingEdge);

    expect(result).toBe(false);
  });

  it("rejects a node recieving connections from multiple parents", () => {
    const existingEdge = [
      {
        id: "root-selector",
        source: "root-1",
        target: "selector-1"
      },
    ];

    const connection = {
      source: "sequence-1",
      target: "selector-1",
      sourceHandle: null,
      targetHandle: null,
    };

    const result = isValidConnection(connection, existingEdge);

    expect(result).toBe(false);
  });

  it ("rejects cycles accross multiple nodes", () => {
    const existingEdge = [
      {
        id: "selector-sequence",
        source: "selector-1",
        target: "sequence-1",
      },
      {
        id: "sequence-patrol",
        source: "sequence-1",
        target: "patrol-1",
      },
    ];

    const connection = {
      source: "patrol-1",
      target: "selector-1",
      sourceHandle: null,
      targetHandle: null,
    };

    const result = isValidConnection(connection, existingEdge);

    expect(result).toBe(false);
  });

  it("allows a valid child connection in an existing tree", () => {
    const existingEdge = [
      {
        id: "root-selector",
        source: "root-1",
        target: "selector-1",
      },
    ];

    const connection = {
      source: "selector-1",
      target: "sequence-1",
      sourceHandle: null,
      targetHandle: null,
    };

    const result = isValidConnection(connection, existingEdge);

    expect(result).toBe(true);
  });

  it("rejects connection targeting Root", () => {
    const connection = {
      source: "selector-1",
      target: "root-1",
      sourceHandle: null,
      targetHandle: null,
    };

    const result = isValidConnection(connection, []);

    expect(result).toBe(false);
  });

  it("rejects connections from Action nodes", () => {
    const nodes = [
      {
        id: "patrol-1",
        type: "action",
        position: {x: 0, y: 0},
        data: {label: "Patrol"},
      },
      {
        id: "selector-1",
        type: "control",
        position: {x: 0, y: 0},
        data: {label: "Selector"},
      },
    ];

    const connection = {
      source: "patrol-1",
      target: "selector-1",
      sourceHandle: null,
      targetHandle: null,
    };

    const result = isValidConnection(connection, [], nodes);

    expect(result).toBe(false);
  });

  it("rejects connections from Condition nodes", () => {
    const nodes = [
      {
        id: "can-see-player-1",
        type: "condition",
        position: {x: 0, y: 0},
        data: {label: "Can See Player"},
      },
      {
        id: "patrol-1",
        type: "action",
        position: {x: 0, y: 0},
        data: {label: "Patrol"},
      },
    ];

    const connection = {
      source: "can-see-player-1",
      target: "patrol-1",
      sourceHandle: null,
      targetHandle: null,
    };

    const result = isValidConnection(connection, [], nodes);

    expect(result).toBe(false);
  })
});
