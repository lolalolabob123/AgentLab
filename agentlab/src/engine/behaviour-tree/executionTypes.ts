export type NodeStatus =
    | "success"
    | "failure"
    | "running";

export type NodeExecuteResult = {
    nodeId: string;
    status: NodeStatus;
};

export type TreeExecutionResult = {
    status: NodeStatus;
    trace: NodeExecuteResult[];
}