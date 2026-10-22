
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
import { useCallback, useEffect, useRef, type DragEvent, useState, useImperativeHandle, forwardRef } from "react";
import "@xyflow/react/dist/style.css";

import type { NodeExecutionResult } from "../engine/behaviour-tree/executionTypes";
import { executeTreeWithTrace } from "../engine/behaviour-tree/executeTreeWithTrace";
import type { NodeStatus } from "../engine/behaviour-tree/executionTypes";

import RootNode from "./nodes/RootNode";
import ControlNode from "./nodes/ControlNode";
import ConditionNode from "./nodes/ConditionNode";
import ActionNode from "./nodes/ActionNode";

import { isValidConnection } from "../engine/behaviour-tree/validation";
import { nodeDefinitions } from "../data/nodeDefinitions";
import { createBehaviourNode } from "../engine/behaviour-tree/NodeFactory";
import type { Position } from "../engine/simulation/detection";
import { canSeePlayer } from "../engine/simulation/detection";
import { DEFAULT_DETECTION_RANGE } from "../engine/simulation/world";
import { getActiveAction } from "../engine/behaviour-tree/getActiveAction";
import { loadBehaviourTree, saveBehaviourTree } from "../engine/persistence/treeStorage";

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
        deletable: false,
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

export type BehaviourEditorHandle = {
    getActiveBehaviour: () => {
        variant: string;
        data: Record<string, unknown>;
    } | null;
};

type BehaviourEditorProps = {
    nodeToAdd: {
        id: string;
        requestId: string;
    } | null;

    nodeToDelete: {
        id: string;
        requestId: string;
    } | null;

    nodeDataUpdate: {
        nodeId: string,
        data: Record<string, unknown>;
        requestId: string;
    } | null;

    onClearCanvasSelection: () => void;
    onSelectCanvasNode: (nodeId: string) => void;
    playerPosition: Position;
    agentPosition: Position;
};

export function getExecutionClassName(
    nodeId: string,
    trace: NodeExecutionResult[]
): string {
    const result = trace.find((entry) => entry.nodeId === nodeId);

    if (!result) {
        return "";
    }

    return `execution-${result.status}`;
}

const BehaviourEditor = forwardRef<
    BehaviourEditorHandle,
    BehaviourEditorProps
>(function BehaviourEditor({ nodeToAdd, nodeToDelete, nodeDataUpdate, onSelectCanvasNode, onClearCanvasSelection, playerPosition, agentPosition }, ref) {

    const [savedTree] = useState(() => loadBehaviourTree());

    const [nodes, setNodes, onNodesChange] =
        useNodesState<Node>(savedTree?.nodes ?? initialNodes);

    const [edges, setEdges, onEdgesChange] =
        useEdgesState<Edge>(savedTree?.edges ?? []);
    
    useEffect(() => {
        saveBehaviourTree(nodes, edges);
    }, [nodes, edges]);

    const [executionTrace, setExecutionTrace] = useState<NodeExecutionResult[]>([]);

    const { screenToFlowPosition, deleteElements, getNode } = useReactFlow();

    const editorRef = useRef<HTMLDivElement>(null);
    const placementCountRef = useRef(0);
    const lastCreateRequestRef = useRef<string | null>(null);
    const lastDeleteRequestRef = useRef<string | null>(null);
    const lastProccessUpdateRef = useRef<string | null>(null);

    const addNodeToCanvas = useCallback((newNode: Node) => {
        setNodes((currentNodes) => [
            ...currentNodes.map((node) => ({
                ...node,
                selected: false,
            })),
            {
                ...newNode,
                selected: true,
            },
        ]);
        onSelectCanvasNode(newNode.id);
    }, [setNodes, onSelectCanvasNode]);

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

        addNodeToCanvas(newNode);
    };

    const runTreePreview = () => {
        const leafStatuses: Record<string, NodeStatus> = {};

        nodes.forEach((node) => {

            if (
                node.type === "condition" &&
                node.data.variant === "can-see-player"
            ) {
                const detectionRange =
                    typeof node.data.detectionRange === "number"
                        ? node.data.detectionRange
                        : DEFAULT_DETECTION_RANGE;

                const detected = canSeePlayer(
                    agentPosition,
                    playerPosition,
                    detectionRange
                );

                leafStatuses[node.id] = detected
                    ? "success"
                    : "failure";
            }

            if (node.type === "action") {
                leafStatuses[node.id] = "running";
            }

        });

        const result = executeTreeWithTrace(
            "root-1",
            nodes,
            edges,
            leafStatuses
        );

        setExecutionTrace((previoiusTrace) => {
            const nextTrace = result.trace;

            const isUnchanged =
                previoiusTrace.length === nextTrace.length &&
                previoiusTrace.every((entry, index) => {
                    const nextEntry = nextTrace[index];

                    return (
                        entry.nodeId === nextEntry.nodeId &&
                        entry.status === nextEntry.status
                    );
                });

                return isUnchanged ? previoiusTrace : nextTrace;
        });
    };

    // Create nodes when double-clicked in the Node Library
    useEffect(() => {
        if (!nodeToAdd || !editorRef.current) return;

        if (lastCreateRequestRef.current === nodeToAdd.requestId) {
            return;
        }

        lastCreateRequestRef.current = nodeToAdd.requestId;

        const definition = nodeDefinitions.find(
            (node) => node.id === nodeToAdd.id
        );

        if (!definition) return;

        const bounds = editorRef.current.getBoundingClientRect();

        const centre = screenToFlowPosition({
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
        });

        const placementIndex = placementCountRef.current;

        const column = placementIndex % 3;
        const row = Math.floor(placementIndex / 3);

        const newNode = createBehaviourNode(definition, {
            x: centre.x - 80 + column * 200,
            y: centre.y - 35 + row * 120,
        });


        addNodeToCanvas(newNode);
        placementCountRef.current += 1;

    }, [nodeToAdd, screenToFlowPosition, addNodeToCanvas]);

    useEffect(() => {
        if (!nodeToDelete) return;

        if (
            lastDeleteRequestRef.current === nodeToDelete.requestId
        ) {
            return;
        }

        lastDeleteRequestRef.current = nodeToDelete.requestId;

        const node = getNode(nodeToDelete.id);

        if (!node || node.type === "root") return;

        void deleteElements({
            nodes: [{ id: node.id }],
        });
    }, [nodeToDelete, getNode, deleteElements]);

    useEffect(() => {
        if (!nodeDataUpdate) return;

        if (
            lastProccessUpdateRef.current === nodeDataUpdate.requestId
        ) {
            return;
        }

        lastProccessUpdateRef.current = nodeDataUpdate.requestId;

        setNodes((currentNodes) =>
            currentNodes.map((node) => {
                if (node.id !== nodeDataUpdate.nodeId) {
                    return node;
                }

                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...nodeDataUpdate.data,
                    },
                };
            })
        );
    }, [nodeDataUpdate, setNodes]);

    useImperativeHandle(ref, () => ({
        getActiveBehaviour: () => {
            const leafStatuses: Record<string, NodeStatus> = {};

            nodes.forEach((node) => {
                if (
                    node.type === "condition" &&
                    node.data.variant === "can-see-player"
                ) {
                    const range =
                        typeof node.data.detectionRange === "number"
                            ? node.data.detectionRange
                            : DEFAULT_DETECTION_RANGE;

                    leafStatuses[node.id] = canSeePlayer(
                        agentPosition,
                        playerPosition,
                        range
                    ) ? "success" : "failure";
                }

                if (node.type === "action") {
                    leafStatuses[node.id] = "running";
                }
            });

            const result = executeTreeWithTrace(
                "root-1",
                nodes,
                edges,
                leafStatuses
            );

            setExecutionTrace(result.trace);

            const action = getActiveAction(nodes, result.trace);

            if (!action) return null;

            return {
                variant: String(action.data.variant),
                data: action.data,
            };
            console.log("Execution status:", result.status);
            console.table(result.trace);
        },
    }), [nodes, edges, agentPosition, playerPosition, ref]);

    return (
        <div
            className="behaviour-editor"
            ref={editorRef}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div className="execution-controls">
                <button
                    type="button"
                    onClick={runTreePreview}
                    className="run-tree-button"
                >
                    Run Tree
                </button>

                <button
                    type="button"
                    onClick={() => setExecutionTrace([])}
                    className="clear-execution-button"
                    disabled={executionTrace.length === 0}
                >
                    Clear
                </button>
            </div>
            <ReactFlow
                colorMode="dark"
                fitView
                nodes={nodes.map((node) => ({
                    ...node,
                    className: [
                        node.className,
                        getExecutionClassName(node.id, executionTrace),
                    ].filter(Boolean).join(" "),
                }))}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => onSelectCanvasNode(node.id)}
                onPaneClick={onClearCanvasSelection}
                deleteKeyCode={["Delete", "Backspace"]}
                onNodesDelete={(deleteNodes) => {
                    const selectedNodeWasDeleted = deleteNodes.some(
                        (node) => node.selected
                    );

                    if (selectedNodeWasDeleted) {
                        onClearCanvasSelection();
                    }
                }}
            >
                <Background color="#454750" gap={20} size={1} />
                <Controls />
            </ReactFlow>
        </div>
    );
});

export default BehaviourEditor;
