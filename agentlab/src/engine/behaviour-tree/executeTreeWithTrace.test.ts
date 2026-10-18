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

});