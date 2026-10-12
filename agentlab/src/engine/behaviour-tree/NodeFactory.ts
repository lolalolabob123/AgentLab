import type { Node, XYPosition } from "@xyflow/react";
import type { NodeDefinition } from "../../types/node";

export function createBehaviourNode(
    definition: NodeDefinition,
    position: XYPosition
): Node {
    return {
        id: crypto.randomUUID(),
        type: definition.category,
        position,
        data: {
            label: definition.label,
            variant: definition.id,
            ...(definition.id === "patrol" && {
                speed: 2,
                patrolRadius: 100,
            }),
            selected: true,
        },
    }
};