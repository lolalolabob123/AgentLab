
import { useNodes } from "@xyflow/react";
import NumericInspectorField from "./NumericInspectorField";

type CanvasNodeInspectorProps = {
    selectedCanvasNodeId: string | null;
    onDeleteNode: (nodeId: string) => void;
    onUpdateNodeData: (
        nodeId: string,
        data: Record<string, unknown>
    ) => void;
};

function CanvasNodeInspector({
    selectedCanvasNodeId,
    onDeleteNode,
    onUpdateNodeData,
}: CanvasNodeInspectorProps) {
    const nodes = useNodes();

    const selectedNode = selectedCanvasNodeId
        ? nodes.find((node) => node.id === selectedCanvasNodeId)
        : undefined;

    if (!selectedNode) {
        return <p>No canvas node selected</p>;
    }

    return (
        <div className="inspector-section">
            <h4>Selected Canvas Node</h4>

            <p>
                <strong>Name:</strong> {String(selectedNode.data.label)}
            </p>

            <p>
                <strong>Type:</strong> {selectedNode.type}
            </p>

            <p>
                <strong>ID:</strong> {selectedNode.id}
            </p>

            {selectedNode.data.variant === "patrol" && (
                <div className="inspector-section">
                    <h4>Patrol Settings</h4>

                    <NumericInspectorField
                        key={`${selectedNode.id}-speed`}
                        label="Speed"
                        value={Number(selectedNode.data.speed ?? 2)}
                        min={0.1}
                        max={10}
                        step={0.1}
                        onChange={(speed) => {
                            onUpdateNodeData(selectedNode.id, { speed });
                        }}
                    />

                    <NumericInspectorField
                        key={`${selectedNode.id}-radius`}
                        label="Patrol Radius"
                        value={Number(selectedNode.data.patrolRadius ?? 100)}
                        min={10}
                        max={500}
                        step={10}
                        onChange={(radius) => {
                            onUpdateNodeData(selectedNode.id, {
                                patrolRadius: radius,
                            });
                        }}
                    />
                </div>
            )}

            {selectedNode.data.variant === "chase-player" && (
                <div className="inspector-section">
                    <h4>Chase Player Settings</h4>

                    <NumericInspectorField
                        key={`${selectedNode.id}-chase-speed`}
                        label="Chase Speed"
                        value={Number(selectedNode.data.chaseSpeed ?? 4)}
                        min={0.1}
                        max={10}
                        step={0.1}
                        onChange={(chaseSpeed) => {
                            onUpdateNodeData(selectedNode.id, {
                                chaseSpeed,
                            });
                        }}
                    />

                    <NumericInspectorField
                        key={`${selectedNode.id}-stop-distance`}
                        label="Stop Distance"
                        value={Number(selectedNode.data.stopDistance ?? 25)}
                        min={0}
                        max={200}
                        step={5}
                        onChange={(stopDistance) => {
                            onUpdateNodeData(selectedNode.id, {
                                stopDistance,
                            });
                        }}
                    />
                </div>
            )}

            {selectedNode.data.variant === "can-see-player" && (
                <div className="inspector-section">
                    <h4>Detection Range</h4>

                    <NumericInspectorField
                        key={`${selectedNode.id}-detection-range`}
                        label="Detection Range"
                        value={Number(selectedNode.data.detectionRange ?? 150)}
                        min={10}
                        max={1000}
                        step={10}
                        onChange={(detectionRange) => {
                            onUpdateNodeData(selectedNode.id, {
                                detectionRange,
                            });
                        }}
                    />
                </div>
            )}

            <button
                type="button"
                className="inspector-delete-button"
                disabled={selectedNode.type === "root"}
                onClick={() => onDeleteNode(selectedNode.id)}
            >
                Delete Node
            </button>
        </div>
    );
}

export default CanvasNodeInspector;
