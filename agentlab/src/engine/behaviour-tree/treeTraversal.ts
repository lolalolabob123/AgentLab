import type {Edge, Node} from "@xyflow/react";

export function getChildNodeIds(
    parentId: string,
    edges: Edge[],
    nodes: Node[]
): string[] {
    const nodeMap = new Map(
        nodes.map((node) => [node.id, node])
    );

    return edges
        .filter((edge) => edge.source === parentId)
        .map((edge) => edge.target)
        .sort((a, b) => {
            const nodeA = nodeMap.get(a);
            const nodeB = nodeMap.get(b);

            const yA = nodeA?.position.y ?? 0;
            const yB = nodeB?.position.y ?? 0;

            if (yA !== yB) {
                return yA - yB;
            }

            return a.localeCompare(b);
        })
}