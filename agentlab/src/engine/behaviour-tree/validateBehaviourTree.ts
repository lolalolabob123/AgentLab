import type { Node, Edge } from "@xyflow/react";

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

    for (const node of nodes) {
        if (node.type === "root") {
            continue;
        }

        const hasParent = edges.some(
            (edge) => edge.target === node.id
        );

        if (!hasParent) {
            issues.push({
                nodeId: node.id,
                severity: "warning",
                message: `${String(node.data.label ?? "Node")} is not connected to the behaviour tree.`,
            });
        }
    }

    return issues;
}