
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    type Node,
    type Edge,
    type Connection,
} from "@xyflow/react";
import { useEffect, useRef, type DragEvent } from "react";
import "@xyflow/react/dist/style.css";

import RootNode from "./nodes/RootNode";
import ControlNode from "./nodes/ControlNode";
import ConditionNode from "./nodes/ConditionNode";
import ActionNode from "./nodes/ActionNode";

import { isValidConnection } from "../engine/behaviour-tree/validation";
import { nodeDefinitions } from "../data/nodeDefinitions";
import { createBehaviourNode } from "../engine/behaviour-tree/NodeFactory";

const nodeTypes = {
    root: RootNode,
    control: ControlNode,
    condition: ConditionNode,
    action: ActionNode,
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

type BehaviourEditorProps = {
    nodeToAdd: {
        id: string;
        requestId: string;
    } | null;
    onClearCanvasSelection: () => void;

    onSelectCanvasNode: (nodeId: string) => void;
};

function BehaviourEditor({ nodeToAdd, onSelectCanvasNode, onClearCanvasSelection }: BehaviourEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const { screenToFlowPosition } = useReactFlow();
    const editorRef = useRef<HTMLDivElement>(null);

    // Validate connections before adding edges
    const onConnect = (connection: Connection) => {
        setEdges((currentEdges) => {
            if (!isValidConnection(connection, currentEdges, nodes)) {
                return currentEdges;
            }

            return addEdge(connection, currentEdges);
        });
    };

    // Allow nodes to be dropped onto the editor
    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };

    // Create nodes at the mouse drop position
    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        const nodeId = event.dataTransfer.getData(
            "application/agentlab-node"
        );

        const definition = nodeDefinitions.find(
            (node) => node.id === nodeId
        );

        if (!definition) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        const newNode = createBehaviourNode(definition, position);

        newNode.origin = [0.5, 0.5];

        setNodes((currentNodes) => [
            ...currentNodes.map((node) => ({
                ...node,
                selected: false,
            })), {
                ...newNode,
                selected: true,
            },
        ]);
        onSelectCanvasNode(newNode.id);
    };

    // Create nodes when double-clicked in the Node Library
    useEffect(() => {
        if (!nodeToAdd || !editorRef.current) return;

        const definition = nodeDefinitions.find(
            (node) => node.id === nodeToAdd.id
        );

        if (!definition) return;

        const bounds = editorRef.current.getBoundingClientRect();

        const centre = screenToFlowPosition({
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
        });

        const newNodeCount = nodes.length - initialNodes.length;
        const column = newNodeCount % 3;
        const row = Math.floor(newNodeCount / 3);

        const newNode = createBehaviourNode(definition, {
            x: centre.x - 80 + column * 200,
            y: centre.y - 35 + row * 120,
        });


        setNodes((currentNodes) => [
            ...currentNodes.map((node) => ({
                ...node,
                selected: false,
            })),
            newNode,
        ]);

        onSelectCanvasNode(newNode.id);

    }, [nodeToAdd, screenToFlowPosition, setNodes, onSelectCanvasNode]);

    return (
        <div
            className="behaviour-editor"
            ref={editorRef}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => onSelectCanvasNode(node.id)}
                onPaneClick={onClearCanvasSelection}
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
