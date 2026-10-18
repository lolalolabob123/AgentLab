import { describe, it, expect } from "vitest";
import type { Node, Edge } from "@xyflow/react";
import { executeTreeWithTrace } from "./executeTreeWithTrace";

describe("Behaviour tree execution tracing", () => {
    it("records the execution status of an Action node", () => {
        const nodes: Node[] = [
            {
                id: "patrol-1",
                type: "action",
                position: { x: 0, y: 0 },
                data: {
                    label: "Patrol",
                    variant: "patrol",
                },
            },
        ];

        const edges: Edge[] = [];

        const leafStatuses = {
            "patrol-1": "running" as const,
        };

        const result = executeTreeWithTrace(
            "patrol-1",
            nodes,
            edges,
            leafStatuses
        );

        expect(result).toEqual({
            status: "running",
            trace: [
                {
                    nodeId: "patrol-1",
                    status: "running",
                },
            ],
        });
    });


    it("records execution through Root and its child", () => {
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

        const leafStatuses = {
            "patrol-1": "running" as const,
        };

        const result = executeTreeWithTrace(
            "root-1",
            nodes,
            edges,
            leafStatuses
        );

        expect(result).toEqual({
            status: "running",
            trace: [
                { nodeId: "patrol-1", status: "running" },
                { nodeId: "root-1", status: "running" },
            ],
        });
    });


    it("traces a Selector falling back to Patrol", () => {
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
                data: { label: "Selector", variant: "selector" },
            },
            {
                id: "sequence-1",
                type: "control",
                position: { x: -100, y: 200 },
                data: { label: "Sequence", variant: "sequence" },
            },
            {
                id: "condition-1",
                type: "condition",
                position: { x: -150, y: 300 },
                data: { label: "Can See Player?", variant: "can-see-player" },
            },
            {
                id: "chase-1",
                type: "action",
                position: { x: -50, y: 300 },
                data: { label: "Chase Player", variant: "chase-player" },
            },
            {
                id: "patrol-1",
                type: "action",
                position: { x: 100, y: 200 },
                data: { label: "Patrol", variant: "patrol" },
            },
        ];

        const edges: Edge[] = [
            { id: "e1", source: "root-1", target: "selector-1" },
            { id: "e2", source: "selector-1", target: "sequence-1" },
            { id: "e3", source: "selector-1", target: "patrol-1" },
            { id: "e4", source: "sequence-1", target: "condition-1" },
            { id: "e5", source: "sequence-1", target: "chase-1" },
        ];

        const result = executeTreeWithTrace(
            "root-1",
            nodes,
            edges,
            {
                "condition-1": "failure",
                "chase-1": "running",
                "patrol-1": "running",
            }
        );

        expect(result).toEqual({
            status: "running",
            trace: [
                { nodeId: "condition-1", status: "failure" },
                { nodeId: "sequence-1", status: "failure" },
                { nodeId: "patrol-1", status: "running" },
                { nodeId: "selector-1", status: "running" },
                { nodeId: "root-1", status: "running" },
            ],
        });
    });


    it("handles circular connections without infinite recursion", () => {
        const nodes: Node[] = [
            {
                id: "selector-1",
                type: "control",
                position: { x: 0, y: 0 },
                data: {
                    label: "Selector",
                    variant: "selector",
                },
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
                source: "selector-1",
                target: "sequence-1",
            },
            {
                id: "edge-2",
                source: "sequence-1",
                target: "selector-1",
            },
        ];

        const result = executeTreeWithTrace(
            "selector-1",
            nodes,
            edges,
            {}
        );

        expect(result.status).toBe("failure");
        expect(result.trace).toContainEqual({
            nodeId: "selector-1",
            status: "failure",
        });
    });


});