import {Handle, Position, type NodeProps} from "@xyflow/react";
import { Footprints, Crosshair } from "lucide-react";

function ActionNode({data}: NodeProps) {
    const isChase = data.variant === "chase-player";
    const Icon = isChase ? Crosshair : Footprints;

    return (
        <div className="action-node">
            <Handle
                type="target"
                position={Position.Top}
            />
            <div className="action-node-header">
                <Icon size={18} />
                <span>{String(data.label)}</span>
            </div>

            <div className="action-node-body">
                Action Node
            </div>
        </div>
    );
}

export default ActionNode;