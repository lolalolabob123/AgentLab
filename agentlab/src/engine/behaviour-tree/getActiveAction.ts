import type { Node } from "@xyflow/react";
import type { NodeExecutionResult } from "./executionTypes";

export function getActiveAction(
    nodes: Node[],
    trace: NodeExecutionResult[]
): Node | null {
    for (const entry of trace) {
        if (entry.status !== "running") {
            continue;
        }

        const node = nodes.find(
            (node) => node.id === entry.nodeId
        );

        if (node?.type === "action") {
            return node;
        }
    }

    return null;
}