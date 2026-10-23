import { describe, it, expect } from "vitest";
import type { Edge, Node } from "@xyflow/react";
import { getChildNodeIds } from "./treeTraversal";

describe("Behaviour tree traversal", () => {
    const nodes: Node[] = [
        {
            id: "root-1",
            type: "root",
            position: { x: 0, y: 0 },
            data: {},
        },
        {
            id: "selector-1",
            type: "control",
            position: { x: 100, y: 0 },
            data: { variant: "selector" },
        },
        {
            id: "patrol-1",
            type: "action",
            position: { x: 200, y: 300 },
            data: { variant: "patrol" },
        },
        {
            id: "chase-1",
            type: "action",
            position: { x: 200, y: 100 },
            data: { variant: "chase-player" },
        },
        {
            id: "other-1",
            type: "action",
            position: { x: 300, y: 200 },
            data: {},
        },
    ];

    const edges: Edge[] = [
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

    it("returns direct children ordered from top to bottom", () => {
        const result = getChildNodeIds(
            "selector-1",
            edges,
            nodes
        );

        expect(result).toEqual(["chase-1", "patrol-1"]);
    });

    it("returns an empty array when a node has no children", () => {
        const result = getChildNodeIds(
            "chase-1",
            edges,
            nodes
        );

        expect(result).toEqual([]);
    });

    it("updates priority when nodes change position", () => {
        const movedNodes = nodes.map((node) =>
            node.id === "patrol-1"
                ? {
                    ...node,
                    position: { x: 200, y: 50 },
                }
                : node
        );

        const result = getChildNodeIds(
            "selector-1",
            edges,
            movedNodes
        );

        expect(result).toEqual(["patrol-1", "chase-1"]);
    });
});