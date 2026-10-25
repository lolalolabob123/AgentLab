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

    it("warns when an Action node is unconnected", () => {
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
                data: { label: "Patrol", variant: "patrol" },
            },
        ];

        const edges: Edge[] = [];

        const issues = validateBehaviourTree(nodes, edges);

        expect(issues).toContainEqual({
            nodeId: "patrol-1",
            severity: "warning",
            message: "Patrol is not connected to the behaviour tree.",
        });
    });

    it("does not warn when an Action node is connected", () => {
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
                data: { label: "Patrol", variant: "patrol" },
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

    it("warns when a connected branch is unreachable from Root", () => {
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
                data: { label: "Patrol", variant: "patrol" },
            },
            {
                id: "selector-1",
                type: "control",
                position: { x: 300, y: 0 },
                data: { label: "Selector", variant: "selector" },
            },
            {
                id: "chase-1",
                type: "action",
                position: { x: 300, y: 100 },
                data: { label: "Chase Player", variant: "chase-player" },
            },
        ];

        const edges: Edge[] = [
            {
                id: "edge-1",
                source: "root-1",
                target: "patrol-1",
            },
            {
                id: "edge-2",
                source: "selector-1",
                target: "chase-1",
            },
        ];

        const issues = validateBehaviourTree(nodes, edges);

        expect(issues).toEqual([
            {
                nodeId: "selector-1",
                severity: "warning",
                message: "Selector is not connected to the behaviour tree.",
            },
            {
                nodeId: "chase-1",
                severity: "warning",
                message: "Chase Player is not connected to the behaviour tree.",
            },
        ]);
    });

    it("warns when Chase Player executes before Can See Player", () => {
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
                data: { label: "Sequence", variant: "sequence" },
            },
            {
                id: "chase-1",
                type: "action",
                position: { x: 0, y: 200 },
                data: { label: "Chase Player", variant: "chase-player" },
            },
            {
                id: "detect-1",
                type: "condition",
                position: { x: 200, y: 300 },
                data: { label: "Can See Player", variant: "can-see-player" },
            },
        ];

        const edges: Edge[] = [
            {
                id: "edge-1",
                source: "root-1",
                target: "sequence-1",
            },
            {
                id: "edge-2",
                source: "sequence-1",
                target: "chase-1",
            },
            {
                id: "edge-3",
                source: "sequence-1",
                target: "detect-1",
            },
        ];

        expect(validateBehaviourTree(nodes, edges)).toContainEqual({
            nodeId: "sequence-1",
            severity: "warning",
            message:
                "Chase Player executes before Can See Player in this Sequence.",
        });
    });

    it("does not warn when Can See Player executes before Chase Player", () => {
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
                data: { label: "Sequence", variant: "sequence" },
            },
            {
                id: "detect-1",
                type: "condition",
                position: { x: 0, y: 200 },
                data: { label: "Can See Player", variant: "can-see-player" },
            },
            {
                id: "chase-1",
                type: "action",
                position: { x: 200, y: 300 },
                data: { label: "Chase Player", variant: "chase-player" },
            },
        ];

        const edges: Edge[] = [
            {
                id: "edge-1",
                source: "root-1",
                target: "sequence-1",
            },
            {
                id: "edge-2",
                source: "sequence-1",
                target: "detect-1",
            },
            {
                id: "edge-3",
                source: "sequence-1",
                target: "chase-1",
            },
        ];

        expect(validateBehaviourTree(nodes, edges)).toEqual([]);
    });
});