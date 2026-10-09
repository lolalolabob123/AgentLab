import type { Edge, Connection } from "@xyflow/react";

export function wouldCreateCycle(
    edges: Edge[],
    source: string,
    target: string
): boolean {
    if (source === target) {
        return true;
    }

    const visited = new Set<string>();
    const toVisit = [target];

    while (toVisit.length > 0) {
        const current = toVisit.pop()!;

        if (current === source) {
            return true;
        }

        if (visited.has(current)) {
            continue;
        }

        visited.add(current);

        const children = edges
            .filter((edge) => edge.source === current)
            .map((edge) => edge.target);
        
        toVisit.push(...children);
    }

    return false;
}

export function isValidConnection(
    connection: Connection,
    edges: Edge[]
): boolean {
    const {source, target} = connection;

    if (source === target) {
        return false;
    }

    if (
        source === "root-1" &&
        edges.some((edge) => edge.source === source)
    ) {
        return false;
    }

    if (edges.some((edge) => edge.target === target)) {
        return false;
    }

    if (wouldCreateCycle(edges, source, target)) {
        return false;
    }

    return true;
}