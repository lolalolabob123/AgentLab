import { ReactFlow, Background, Controls, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Node } from "@xyflow/react";
import RootNode from "./nodes/RootNode";
import ControlNode from "./nodes/ControlNode";

const nodeTypes = {
    root: RootNode,
    control: ControlNode,
};

const initialNodes: Node[] = [
    {
        id: "root-1",
        type: "root",
        position: { x: 100, y: 100 },
        data: { label: "Root" },
    },
    {
        id: "selector-1",
        type: "control",
        position: {x: 100, y: 200},
        data: {
            label: "Selector",
            variant: "selector",
        },
    },
];

function BehaviourEditor() {

    const [nodes, setNodes, onNodeChange] = useNodesState(initialNodes);

    return (
        <div className="behaviour-editor">
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodeChange}
                nodeTypes={nodeTypes}
                edges={[]}
                colorMode="dark"
                fitView
            >
                <Background color="#454750" gap={20} size={1} />
                <Controls />
            </ReactFlow>
        </div>
    );
}

export default BehaviourEditor;