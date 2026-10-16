import {describe, it, expect} from "vitest";
import {executeTree} from "./executeTree";
import type {Node, Edge} from "@xyflow/react";

describe("Behaviour tree execution", () => {
    it("returns the supplied status for an Action node", () => {
        const nodes: Node[] = [
            {
                id: "patrol-1",
                type: "action",
                position: {x: 0, y: 0},
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

        const result = executeTree(
            "patrol-1",
            nodes,
            edges,
            leafStatuses
        );

        expect(result).toBe("running");
    });

    it("returns the supplied status for a Condition node", () => {
        const nodes: Node[] = [
            {
                id: "can-see-player-1",
                type: "condition",
                position: {x: 0, y: 0},
                data: {
                    label: "Can See Player?",
                    variant: "can-see-player",
                },
            },
        ];

        const edges: Edge[] = [];

        const leafStatuses = {
            "can-see-player-1": "success" as const,
        };

        const result = executeTree(
            "can-see-player-1",
            nodes,
            edges,
            leafStatuses
        );

        expect(result).toBe("success");
    });
})