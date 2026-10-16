import type {Node, Edge} from "@xyflow/react";
import type { NodeStatus } from "./executionTypes";

export function executeTree(
    nodeId: string,
    nodes: Node[],
    _edges: Edge[],
    leafStatuses: Record<string, NodeStatus>
): NodeStatus {
    const node = nodes.find((node) => node.id === nodeId);

    if (!node) {
        return "failure";
    }

    if (node.type === "action" || node.type === "condition") {
        return leafStatuses[nodeId] ?? "failure";
    }

    return "failure";
}