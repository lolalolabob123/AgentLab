import type {Node, Edge} from "@xyflow/react";

const STORAGE_KEY = "agentlab-behaviour-tree";

export type SavedBehaviourTree = {
    nodes: Node[];
    edges: Edge[];
};

export function saveBehaviourTree(
    nodes: Node[],
    edges: Edge[]
): void {
    const tree: SavedBehaviourTree = {
        nodes,
        edges,
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tree)
    );
}

export function loadBehaviourTree(): SavedBehaviourTree | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return null;
        }

        const parsed: unknown = JSON.parse(saved);

        if (
            typeof parsed !== "object" ||
            parsed === null ||
            !("nodes" in parsed) ||
            !Array.isArray(parsed.nodes) ||
            !("edges" in parsed) ||
            !Array.isArray(parsed.edges)
        ) {
            return null;
        }

        return {
            nodes: parsed.nodes as Node[],
            edges: parsed.edges as Edge[],
        };
    } catch {
        return null;
    }
}