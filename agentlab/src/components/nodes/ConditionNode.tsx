import {Handle, Position, type NodeProps} from "@xyflow/react";
import {Eye} from "lucide-react";

function ConditionNode({data}: NodeProps) {
    return (
        <div className="condition-node">
            <Handle
                type="target"
                position={Position.Top}
            />

            <div className="condition-node-header">
                <Eye size={16} />
                <span>{String(data.label)}</span>
            </div>

            <div className="condition-node-body">
                Condition
            </div>
        </div>
    );
}

export default ConditionNode;