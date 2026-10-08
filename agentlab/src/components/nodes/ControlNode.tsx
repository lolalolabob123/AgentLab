import {Handle, Position, type NodeProps} from "@xyflow/react";
import { GitBranch, ListOrdered } from "lucide-react";

type ControlNodeData = {
    label: string;
    variant: "selector" | "sequence";
};

function ControlNode({data}: NodeProps) {
    const nodeData = data as ControlNodeData;

    const Icon =
        nodeData.variant === "selector" ? GitBranch : ListOrdered;
    
    return (
        <div className="control-node">
            <Handle
                type="target"
                position={Position.Top}
                className="node-handle"
            />

            <div className="control-node-header">
                <Icon size={14} />
                <span>{nodeData.label}</span>
            </div>

            <div className="control-node-body">
                Control node
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="node-handle"
            />
        </div>
    );
}

export default ControlNode;