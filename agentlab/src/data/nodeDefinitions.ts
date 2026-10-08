import type { NodeDefinition } from "../types/node";

export const nodeDefinitions: NodeDefinition[] = [
    {
        id: "selector",
        label: "Selector",
        category: "control",
        description: "Executes children in priority order until one returns Success or Running. Returns Failure if all children fail.",
    },
    {
        id: "sequence",
        label: "Sequence",
        category: "control",
        description: "Executes children in order until one returns Failure or Running. Returns Success when all children succeed.",
    },
    {
        id: "can-see-player",
        label: "Can See Player",
        category: "condition",
        description: "Checks whether the agent can currently see the player.",
    },
    {
        id: "patrol",
        label: "Patrol",
        category: "action",
        description: "Moves the agent between predefined patrol waypoints.",
    },
    {
        id: "chase-player",
        label: "Chase Player",
        category: "action",
        description: "Moves the agent towards the player's current or last known position.",
    },
];