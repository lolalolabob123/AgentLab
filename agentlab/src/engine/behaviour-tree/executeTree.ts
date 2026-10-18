import type {Node, Edge} from "@xyflow/react";
import type { NodeStatus } from "./executionTypes";
import { getChildNodeIds } from "./treeTraversal";

export function executeTree(
    nodeId: string,
    nodes: Node[],
    edges: Edge[],
    leafStatuses: Record<string, NodeStatus>
): NodeStatus {
    const node = nodes.find((node) => node.id === nodeId);

    if (!node) {
        return "failure";
    }

    if (node.type === "action" || node.type === "condition") {
        return leafStatuses[nodeId] ?? "failure";
    }

    if (node.type === "root") {
        const children = getChildNodeIds(nodeId, edges);

        if (children.length === 0) {
            return "failure";
        }

        return executeTree(
            children[0],
            nodes,
            edges,
            leafStatuses
        );
    }

    if (node.type === "control" && node.data.variant === "sequence") {
        const children = getChildNodeIds(nodeId, edges);

        for (const childId of children) {
            const status = executeTree(
                childId,
                nodes,
                edges,
                leafStatuses
            );

            if (status === "failure") {
                return "failure";
            }

            if (status === "running") {
                return "running";
            }
        }

        return "success";
    }

    if (node.type === "control" && node.data.variant === "selector") {
        const children = getChildNodeIds(nodeId, edges);

        for (const childId of children) {
            const status = executeTree(
                childId,
                nodes,
                edges,
                leafStatuses
            );

            if (status === "success") {
                return "success";
            }

            if (status === "running") {
                return "running";
            }
        }

        return "failure";
    }

    return "failure";
}