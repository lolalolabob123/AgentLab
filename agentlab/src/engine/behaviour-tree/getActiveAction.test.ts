import {describe, it, expect} from "vitest";
import type {Node} from "@xyflow/react";
import type { NodeExecutionResult } from "./executionTypes";
import { getActiveAction } from "./getActiveAction";

describe("Active behaviour action", () => {
    const nodes: Node[] = [
        {
            id: "chase-1",
            type: "action",
            position: {x: 0, y: 0},
            data: {
                label: "Chase Player",
                variant: "chase-player"
            },
        },
        {
            id: "patrol-1",
            type: "action",
            position: {x: 100, y: 0},
            data: {
                label: "Patrol",
                variant: "patrol",
            },
        },
    ];

    it ("finds the running Chase action", () => {
        const trace: NodeExecutionResult[] = [
            {nodeId: "chase-1", status: "running"},
            {nodeId: "sequence-1", status: "running"},
            {nodeId: "root-1", status: "running"},
        ];

        const action = getActiveAction(nodes, trace);

        expect(action?.data.variant).toBe("chase-player");
    });

    it("finds Patrol when Chase is not expected", () => {
        const trace: NodeExecutionResult[] = [
            {nodeId: "condition-1", status: "failure"},
            {nodeId: "sequence-1", status: "failure"},
            {nodeId: "patrol-1", status: "running"},
            {nodeId: "selector-1", status: "running"},
        ];

        const action = getActiveAction(nodes, trace);

        expect(action?.data.variant).toBe("patrol");
    });

    it("returns null when no Action is running", () => {
        const trace: NodeExecutionResult[] = [
            {nodeId: "condition-1", status: "failure"},
            {nodeId: "sequence-1", status: "failure"},
        ];

        expect(getActiveAction(nodes, trace)).toBeNull();
    });
});