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

    it("executes the child connected to Root", () => {
        const nodes: Node[] = [
            {
                id: "root-1",
                type: "root",
                position: {x: 0, y: 0},
                data: {label: "Root"},
            },
            {
                id: "patrol-1",
                type: "action",
                position: {x: 0, y: 100},
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

        const result = executeTree(
            "root-1",
            nodes,
            edges,
            leafStatuses
        );

        expect(result).toBe("running");
    });

    it("executes a Sequence with connected children", () => {
        const nodes: Node[] = [
            {
                id: "root-1",
                type: "root",
                position: {x: 0, y: 0},
                data: {label: "Root"},
            },
            {
                id: "sequence-1",
                type: "control",
                position: {x: 0, y: 100},
                data: {
                    label: "Sequence",
                    variant: "sequence",
                },
            },
            {
                id: "condition-1",
                type: "condition",
                position: {x: -100, y: 200},
                data: {
                    label: "Can See Player?",
                    variant: "can-see-player",
                },
            },
            {
                id: "chase-1",
                type: "action",
                position: {x: 100, y: 300},
                data: {
                    label: "Chase Player",
                    variant: "chase-player",
                },
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
                target: "condition-1",
            },
            {
                id: "edge-3",
                source: "sequence-1",
                target: "chase-1",
            },
        ];

        const leafStatuses = {
            "condition-1": "success" as const,
            "chase-1": "running" as const,
        };

        const result = executeTree(
            "root-1",
            nodes,
            edges,
            leafStatuses
        );

        expect(result).toBe("running");
    });

    it("stops a Sequence when its first child fails", () => {
        const nodes: Node[] = [
            {
                id: "sequence-1",
                type: "control",
                position: {x: 0, y: 0},
                data: {
                    label: "Sequence",
                    variant: "sequence",
                },
            },
                {
                    id: "condition-1",
                    type: "condition",
                    position: {x: -100, y: 100},
                    data: {
                        label: "Can See Player?",
                        variant: "can-see-player",
                    },
                },
                {
                    id: "chase-1",
                    type: "action",
                    position: {x: 100, y: 200},
                    data: {
                        label: "Chase Player",
                        variant: "chase-player",
                    },
                },
        ];

        const edges: Edge[] = [
            {
                id: "edge-1",
                source: "sequence-1",
                target: "condition-1",
            },
            {
                id: "edge-2",
                source: "sequence-1",
                target: "chase-1",
            },
        ];

        const leafStatuses = {
            "condition-1": "failure" as const,
            "chase-1": "running" as const,
        };

        const result = executeTree(
            "sequence-1",
            nodes,
            edges,
            leafStatuses
        );

        expect(result).toBe("failure");
    });

    it("falls back to Patrol when the chase sequence fails", () => {
        const nodes: Node[] = [
            {
                id: "root-1",
                type: "root",
                position: {x: 0, y: 0},
                data: {
                    label: "Root"
                },
            },
            {
                id: "selector-1",
                type: "control",
                position: {x: 0, y: 100},
                data: {
                    label: "Selector",
                    variant: "selector"
                },
            },
            {
                id: "sequence-1",
                type: "control",
                position: {x: -100, y: 200},
                data: {label: "Sequence", variant: "sequence"},
            },
            {
                id: "condition-1",
                type: "condition",
                position: {x: -150, y: 300},
                data: {
                    label: "Can See Player?",
                    variant: "can-see-player"
                },
            },
            {
                id: "chase-1",
                type: "action",
                position: {x: -50, y: 300},
                data: {
                    label: "Chase Player",
                    variant: "chase-player"
                },
            },
            {
                id: "patrol-1",
                type: "action",
                position: {x: 100, y: 200},
                data: {
                    label: "Patrol",
                    variant: "patrol",
                },
            },
        ];

        const edges: Edge[] = [
            {id: "e1", source: "root-1", target: "selector-1"},
            {id: "e2", source: "selector-1", target: "sequence-1"},
            {id: "e3", source: "selector-1", target: "patrol-1"},
            {id: "e4", source: "sequence-1", target: "condition-1"},
            {id: "e5", source: "sequence-1", target: "chase-1"},
        ];

        const leafStatuses = {
            "condition-1": "failure" as const,
            "chase-1": "running" as const,
            "patrol-1": "running" as const,
        };

        const result = executeTree(
            "root-1",
            nodes,
            edges,
            leafStatuses
        );

        expect(result).toBe("running");
    });
})