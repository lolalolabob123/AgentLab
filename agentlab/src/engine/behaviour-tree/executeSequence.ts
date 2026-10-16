import type { NodeStatus } from "./executionTypes";

export function executeSequence(
    childStatus: NodeStatus[]
): NodeStatus {
    for (const status of childStatus) {
        if (status === "failure") {
            return "failure";
        }

        if (status === "running") {
            return "running";
        }
    }

    return "success";
}