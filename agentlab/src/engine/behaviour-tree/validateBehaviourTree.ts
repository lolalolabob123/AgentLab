import type { Node, Edge } from "@xyflow/react";
import { getChildNodeIds } from "./treeTraversal";

export type ValidationIssue = {
    nodeId: string;
    severity: "error" | "warning";
    message: string;
};

export function validateBehaviourTree(
    nodes: Node[],
    edges: Edge[]
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const rootNode = nodes.find(
        (node) => node.type === "root"
    );

    if (!rootNode) {
        issues.push({
            nodeId: "",
            severity: "error",
            message: "Behaviour tree has no Root node.",
        });

        return issues;
    }

    const rootHasChild = edges.some(
        (edge) => edge.source === rootNode.id
    );

    if (!rootHasChild) {
        issues.push({
            nodeId: rootNode.id,
            severity: "error",
            message: "Root must have a connected child.",
        });
    }

    const controlNodes = nodes.filter(
        (node) =>
            node.type === "control" &&
            (node.data.variant === "selector" ||
                node.data.variant === "sequence")
    );

    for (const node of controlNodes) {
        const hasChildren = edges.some(
            (edge) => edge.source === node.id
        );

        if (!hasChildren) {
            const nodeName =
                node.data.variant === "selector"
                    ? "Selector"
                    : "Sequence";

            issues.push({
                nodeId: node.id,
                severity: "warning",
                message: `${nodeName} has no connected children.`,
            });
        }
    }

    const reachableNodes = new Set<string>();
    const toVisit = [rootNode.id];

    while (toVisit.length > 0) {
        const current = toVisit.pop()!;

        if (reachableNodes.has(current)) {
            continue;
        }

        reachableNodes.add(current);

        const children = edges
            .filter((edge) => edge.source === current)
            .map((edge => edge.target));
        toVisit.push(...children);
    }

    for (const node of nodes) {
        if (node.id === rootNode.id) {
            continue;
        }

        if (!reachableNodes.has(node.id)) {
            issues.push({
                nodeId: node.id,
                severity: "warning",
                message: `${String(node.data.label ?? "Node")} is not connected to the behaviour tree.`,
            });
        }
    }

    for (const node of nodes) {
        if (
            node.type !== "control" ||
            node.data.variant !== "sequence"
        ) {
            continue;
        }

        const childIds = getChildNodeIds(node.id, edges, nodes);

        const children = childIds
            .map((id) => nodes.find((child) => child.id === id))
            .filter((child): child is Node => child !== undefined);

        const chaseIndex = children.findIndex(
            (child) =>
                child.type === "action" &&
                child.data.variant === "chase-player"
        );

        const detectionIndex = children.findIndex(
            (child) =>
                child.type === "condition" &&
                child.data.variant === "can-see-player"
        );

        if (
            chaseIndex !== -1 &&
            detectionIndex !== -1 &&
            chaseIndex < detectionIndex
        ) {
            issues.push({
                nodeId: node.id,
                severity: "warning",
                message: 
                "Chase Player executes before Can See Player in this Sequence.",
            });
        }
    }

    return issues;
}