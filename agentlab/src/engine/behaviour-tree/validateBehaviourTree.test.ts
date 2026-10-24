import { describe, it, expect } from "vitest";
import type { Node, Edge } from "@xyflow/react";
import { validateBehaviourTree } from "./validateBehaviourTree";

describe("Behaviour tree validation", () => {
    it("reports an error when no Root node exists", () => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        const issues = validateBehaviourTree(nodes, edges);

        expect(issues).toEqual([
            {
                nodeId: "",
                severity: "error",
                message: "Behaviour tree has no Root node.",
            },
        ]);
    });

    it("reports an error when Root has no child", () => {
        const nodes: Node[] = [
            {
                id: "root-1",
                type: "root",
                position: { x: 0, y: 0 },
                data: { label: "Root" },
            },
        ];

        const issues = validateBehaviourTree(nodes, []);

        expect(issues).toEqual([
            {
                nodeId: "root-1",
                severity: "error",
                message: "Root must have a connected child.",
            },
        ]);
    });

    it("reports no issues when Root has a connected child", () => {
        const nodes: Node[] = [
            {
                id: "root-1",
                type: "root",
                position: { x: 0, y: 0 },
                data: { label: "Root" },
            },
            {
                id: "patrol-1",
                type: "action",
                position: { x: 0, y: 100 },
                data: {
                    label: "Patrol",
                    variant: "patrol",
                },
            },
        ];

        const edges: Edge[] = [
            {
                id: "edge-1",
                source: "root-1",
                target: "patrol-1",
            },
        ];

        const issues = validateBehaviourTree(nodes, edges);

        expect(issues).toEqual([]);
    });

    it("warns when a Selector has no children", () => {
        const nodes: Node[] = [
            {
                id: "root-1",
                type: "root",
                position: { x: 0, y: 0 },
                data: { label: "Root" },
            },
            {
                id: "selector-1",
                type: "control",
                position: { x: 0, y: 100 },
                data: {
                    label: "Selector",
                    variant: "selector",
                },
            },
        ];

        const edges: Edge[] = [
            {
                id: "edge-1",
                source: "root-1",
                target: "selector-1",
            },
        ];

        expect(validateBehaviourTree(nodes, edges)).toEqual([
            {
                nodeId: "selector-1",
                severity: "warning",
                message: "Selector has no connected children.",
            },
        ]);
    });

    it("warns when a Sequence has no children", () => {
        const nodes: Node[] = [
            {
                id: "root-1",
                type: "root",
                position: { x: 0, y: 0 },
                data: { label: "Root" },
            },
            {
                id: "sequence-1",
                type: "control",
                position: { x: 0, y: 100 },
                data: {
                    label: "Sequence",
                    variant: "sequence",
                },
            },
        ];

        const edges: Edge[] = [
            {
                id: "edge-1",
                source: "root-1",
                target: "sequence-1",
            },
        ];

        expect(validateBehaviourTree(nodes, edges)).toEqual([
            {
                nodeId: "sequence-1",
                severity: "warning",
                message: "Sequence has no connected children.",
            },
        ]);
    });
});