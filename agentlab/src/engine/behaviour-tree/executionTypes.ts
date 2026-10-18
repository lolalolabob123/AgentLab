export type NodeStatus =
    | "success"
    | "failure"
    | "running";

export type NodeExecutionResult = {
    nodeId: string;
    status: NodeStatus;
};

export type TreeExecutionResult = {
    status: NodeStatus;
    trace: NodeExecutionResult[];
}