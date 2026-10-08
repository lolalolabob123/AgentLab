import {Handle, Position} from "@xyflow/react";
import {Play} from "lucide-react";

function RootNode() {
    return (
        <div className="root-node">
            <div className="root-node-header">
                <Play size={14} />
                <span>Root</span>
            </div>

            <div className="root-node-body">
                Entry point
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="node-handle"
            />
        </div>
    );
}

export default RootNode;