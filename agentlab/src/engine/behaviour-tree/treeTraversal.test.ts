import { describe, it, expect } from "vitest";
import { getChildNodeIds } from "./treeTraversal";

describe("Behaviour tree traversal", () => {
    it("returns the direct children of a node", () => {
        const edges = [
            {
                id: "edge-1",
                source: "root-1",
                target: "selector-1",
            },
            {
                id: "edge-2",
                source: "selector-1",
                target: "patrol-1",
            },
            {
                id: "edge-3",
                source: "selector-1",
                target: "chase-1",
            },
            {
                id: "edge-4",
                source: "patrol-1",
                target: "other-1",
            },
        ];

        const result = getChildNodeIds("selector-1", edges);

        expect(result).toEqual(["patrol-1", "chase-1"]);
    });

    it("returns an empty array when a node has no children", () => {
        const edges = [
            {
                id: "edge-1",
                source: "root-1",
                target: "selector-1",
            },
            {
                id: "edge-2",
                source: "selector-1",
                target: "patrol-1",
            },
        ];

        const result = getChildNodeIds("patrol-1", edges);

        expect(result).toEqual([]);
    })
});