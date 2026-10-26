export type SimulationHistoryEventType =
    | "simulation-started"
    | "simulation-paused"
    | "behaviour-changed"
    | "condition-changed"
    | "simulation-reset";

export type SimulationHistoryEvent = {
    id: string;
    timestamp: number;
    type: SimulationHistoryEventType;
    message: string;
    nodeId?: string;
};