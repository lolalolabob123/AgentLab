import type { Edge } from "@xyflow/react";

export function getChildNodeIds(
    parentId: string,
    edges: Edge[]
): string[] {
    return edges
        .filter((edge) => edge.source === parentId)
        .map((edge) => edge.target);
}