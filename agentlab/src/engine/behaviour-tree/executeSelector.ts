import type { NodeStatus } from "./executionTypes";

export function executeSelector(
    childStatus: NodeStatus[]
): NodeStatus {
    for (const status of childStatus) {
        if (status === "success") {
            return "success";
        }

        if (status === "running") {
            return "running";
        }
    }

    return "failure";
}