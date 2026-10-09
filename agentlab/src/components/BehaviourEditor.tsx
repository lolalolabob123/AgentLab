import { ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge, type Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Node, Edge } from "@xyflow/react";
import RootNode from "./nodes/RootNode";
import ControlNode from "./nodes/ControlNode";
import { isValidConnection } from "../engine/behaviour-tree/validation";

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
        position: { x: 100, y: 200 },
        data: {
            label: "Selector",
            variant: "selector",
        },
    },
    {
        id: "sequence-1",
        type: "control",
        position: { x: 350, y: 260 },
        data: {
            label: "Sequence",
            variant: "sequence",
        },
    },
];

function BehaviourEditor() {

    const [nodes, setNodes, onNodeChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const onConnect = (connection: Connection) => {
        setEdges((currentEdges) => {
            if (!isValidConnection(connection, currentEdges)) {
                return currentEdges;
            }

            return addEdge(connection, currentEdges);
        });
    };

    return (
        <div className="behaviour-editor">
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodeChange}
                nodeTypes={nodeTypes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
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