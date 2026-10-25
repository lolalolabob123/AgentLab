
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
import { useCallback, useEffect, useRef, type DragEvent, useState, useImperativeHandle, forwardRef, useMemo } from "react";
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
import { getChildNodeIds } from "../engine/behaviour-tree/treeTraversal";
import { validateBehaviourTree } from "../engine/behaviour-tree/validateBehaviourTree";

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

    canRunSimulation: () => boolean;

    getValidationCounts: () => {
        errors: number;
        warnings: number;
    }
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

    onValidationChange: (counts: {
        errors: number;
        warnings: number;
    }) => void;

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
>(function BehaviourEditor({ nodeToAdd, nodeToDelete, nodeDataUpdate, onSelectCanvasNode, onClearCanvasSelection, playerPosition, agentPosition, onValidationChange, }, ref) {

    const [savedTree] = useState(() => loadBehaviourTree());

    const [nodes, setNodes, onNodesChange] =
        useNodesState<Node>(savedTree?.nodes ?? initialNodes);

    const [edges, setEdges, onEdgesChange] =
        useEdgesState<Edge>(savedTree?.edges ?? []);

    const validationIssues = useMemo(
        () => validateBehaviourTree(nodes, edges),
        [nodes, edges]
    );

    const errorCount = validationIssues.filter(
        (issues) => issues.severity === "error"
    ).length;

    const warningCount = validationIssues.filter(
        (issue) => issue.severity === "warning"
    ).length;

    useEffect(() => {
        onValidationChange({
            errors: errorCount,
            warnings: warningCount,
        });
    }, [errorCount, warningCount, onValidationChange]);

    const priorityByEdgeId = new Map<string, number>();

    for (const node of nodes) {
        if (
            node.type !== "control" ||
            (node.data.variant !== "selector" &&
                node.data.variant !== "sequence")
        ) {
            continue;
        }

        const childIds = getChildNodeIds(node.id, edges, nodes);

        childIds.forEach((childId, index) => {
            const edge = edges.find(
                (edge) =>
                    edge.source === node.id &&
                    edge.target === childId
            );

            if (edge) {
                priorityByEdgeId.set(edge.id, index + 1);
            }
        });
    }

    useEffect(() => {
        saveBehaviourTree(nodes, edges);
    }, [nodes, edges]);

    const [executionTrace, setExecutionTrace] = useState<NodeExecutionResult[]>([]);

    const [isProblemsOpen, setIsProblemsOpen] = useState(false);

    const { screenToFlowPosition, deleteElements, getNode, setCenter, getZoom } = useReactFlow();

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

        if (errorCount > 0) {
            setExecutionTrace([]);
            setIsProblemsOpen(true);
            return;
        }

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

        canRunSimulation: () => {
            if (errorCount > 0) {
                setExecutionTrace([]);
                setIsProblemsOpen(true);
                return false;
            }

            return true;
        },

        getValidationCounts: () => ({
            errors: errorCount,
            warnings: warningCount,
        }),

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

                    const detected = canSeePlayer(
                        agentPosition,
                        playerPosition,
                        range
                    );

                    leafStatuses[node.id] = detected ? "success" : "failure";
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
        },
    }), [nodes, edges, agentPosition, playerPosition, ref, errorCount]);

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

            <div className="problems-container">
                <button
                    type="button"
                    className="problems-indicator"
                    onClick={() => setIsProblemsOpen((open) => !open)}
                    aria-expanded={isProblemsOpen}
                    aria-controls="problems-panel"
                >
                    <span className="problems-indicator-title">
                        Problems
                    </span>

                    <span className="problems-count error">
                        <span aria-hidden="true">✕</span>
                        {errorCount}
                    </span>

                    <span className="problems-count warning">
                        <span aria-hidden="true">⚠</span>
                        {warningCount}
                    </span>

                    <span aria-hidden="true">
                        {isProblemsOpen ? "▴" : "▾"}
                    </span>
                </button>

                {isProblemsOpen && (
                    <div
                        id="problems-panel"
                        className="problems-panel"
                    >
                        {validationIssues.length === 0 ? (
                            <p>No problems detected.</p>
                        ) : (
                            validationIssues.map((issue, index) => (
                                <button
                                    key={`${issue.nodeId}-${index}`}
                                    type="button"
                                    className={`problem-item ${issue.severity}`}
                                    disabled={!issue.nodeId}
                                    onClick={() => {
                                        setNodes((currentNodes) =>
                                            currentNodes.map((node) => ({
                                                ...node,
                                                selected: node.id === issue.nodeId,
                                            }))
                                        );

                                        onSelectCanvasNode(issue.nodeId);

                                        const node = getNode(issue.nodeId);

                                        if (node) {
                                            const width = node.measured?.width ?? 160;
                                            const height = node.measured?.height ?? 80;

                                            void setCenter(
                                                node.position.x + width / 2,
                                                node.position.y + height / 2,
                                                {
                                                    zoom: getZoom(),
                                                    duration: 400,
                                                }
                                            );
                                        }
                                    }}
                                >
                                    <span aria-hidden="true">
                                        {issue.severity === "error" ? "✕" : "⚠"}
                                    </span>

                                    <span>{issue.message}</span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {executionTrace.length > 0 && (
                <div className="execution-legend">
                    <span className="execution-legend-title">
                        Execution Status
                    </span>

                    <div className="execution-legend-items">
                        <span className="execution-legend-item">
                            <span className="execution-legend-line running" />
                            Running / Success
                        </span>

                        <span className="execution-legend-item">
                            <span className="execution-legend-line failure" />
                            Failure
                        </span>

                        <span className="execution-legend-item">
                            <span className="execution-legend-line inactive" />
                            Not Visited
                        </span>
                    </div>
                </div>
            )}

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
                edges={edges.map((edge) => {
                    const priority = priorityByEdgeId.get(edge.id);

                    const targetExecution = executionTrace.find(
                        (entry) => entry.nodeId === edge.target
                    );

                    const isExecutedEdge =
                        executionTrace.some((entry) => entry.nodeId === edge.source) &&
                        targetExecution !== undefined;

                    const edgeColor =
                        !isExecutedEdge
                            ? "#555965"
                            : targetExecution.status === "failure"
                                ? "#ef4444"
                                : "#38bdf8";

                    return {
                        ...edge,
                        label: priority !== undefined ? String(priority) : undefined,
                        labelStyle: {
                            fill: "#e5e7eb",
                            fontSize: 12,
                            fontWeight: 600,
                        },
                        labelBgStyle: {
                            fill: "#252830",
                            fillOpacity: 0.95,
                        },
                        labelBgPadding: [6, 4] as [number, number],
                        labelBgBorderRadius: 5,

                        animated: false,

                        style: {
                            ...edge.style,
                            stroke: edgeColor,
                            strokeWidth: isExecutedEdge ? 2 : 1.5,
                            opacity: isExecutedEdge ? 1 : 0.65,
                        },
                    };
                })}
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
