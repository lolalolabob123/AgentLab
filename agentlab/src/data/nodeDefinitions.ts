import type { nodeDefinition } from "../types/node";

export const nodeDefinitions: nodeDefinition[] = [
    {
        id: "selector",
        label: "Selector",
        category: "control",
    },
    {
        id: "sequence",
        label: "Sequence",
        category: "control",
    },
    {
        id: "can-see-player",
        label: "Can See Player",
        category: "condition",
    },
    {
        id: "patrol",
        label: "Patrol",
        category: "action",
    },
    {
        id: "chase-player",
        label: "Chase Player",
        category: "action",
    },
];