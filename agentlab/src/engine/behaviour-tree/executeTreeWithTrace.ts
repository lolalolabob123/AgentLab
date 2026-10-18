import type { Node, Edge } from "@xyflow/react";
import type { NodeStatus, TreeExecutionResult } from "./executionTypes";
import { getChildNodeIds } from "./treeTraversal";

export function executeTreeWithTrace(
    nodeId: string,
    nodes: Node[],
    edges: Edge[],
    leafStatuses: Record<string, NodeStatus>,
    visited: Set<string> = new Set()
): TreeExecutionResult {
    const trace: TreeExecutionResult["trace"] = [];

    if (visited.has(nodeId)) {
        return {
            status: "failure",
            trace: [{nodeId, status: "failure"}],
        };
    }

    const nextVisited = new Set(visited);
    nextVisited.add(nodeId);

    const node = nodes.find((node) => node.id === nodeId);

    if (!node) {
        return {
            status: "failure",
            trace,
        };
    }

    if (node.type === "action" || node.type === "condition") {
        const status = leafStatuses[nodeId] ?? "failure";

        trace.push({
            nodeId,
            status,
        });

        return {
            status,
            trace,
        };
    }


    if (node.type === "control" && node.data.variant === "sequence") {
        const children = getChildNodeIds(nodeId, edges);

        for (const childId of children) {
            const childResult = executeTreeWithTrace(
                childId,
                nodes,
                edges,
                leafStatuses,
                nextVisited
            );

            trace.push(...childResult.trace);

            if (childResult.status === "failure" ||
                childResult.status === "running") {
                trace.push({
                    nodeId,
                    status: childResult.status,
                });

                return {
                    status: childResult.status,
                    trace,
                };
            }
        }

        trace.push({
            nodeId,
            status: "success",
        });

        return {
            status: "success",
            trace,
        };
    }


    if (node.type === "control" && node.data.variant === "selector") {
        const children = getChildNodeIds(nodeId, edges);

        for (const childId of children) {
            const childResult = executeTreeWithTrace(
                childId,
                nodes,
                edges,
                leafStatuses,
                nextVisited
            );

            trace.push(...childResult.trace);

            if (
                childResult.status === "success" ||
                childResult.status === "running"
            ) {
                trace.push({
                    nodeId,
                    status: childResult.status,
                });

                return {
                    status: childResult.status,
                    trace,
                };
            }
        }

        trace.push({
            nodeId,
            status: "failure",
        });

        return {
            status: "failure",
            trace,
        };
    }



    if (node.type === "root") {
        const children = getChildNodeIds(nodeId, edges);

        if (children.length === 0) {
            trace.push({
                nodeId,
                status: "failure",
            });

            return {
                status: "failure",
                trace,
            };
        }

        const childResult = executeTreeWithTrace(
            children[0],
            nodes,
            edges,
            leafStatuses,
            nextVisited
        );

        trace.push(...childResult.trace);

        trace.push({
            nodeId,
            status: childResult.status,
        });

        return {
            status: childResult.status,
            trace,
        }
    }

    return {
        status: "failure",
        trace,
    };
}