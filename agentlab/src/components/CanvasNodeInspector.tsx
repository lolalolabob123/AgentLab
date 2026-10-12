import { useNodes } from "@xyflow/react";
import { useEffect, useState } from "react";
import NumericInspectorField from "./NumericInspectorField";

type CanvasNodeInspectorProps = {
    selectedCanvasNodeId: string | null;
    onDeleteNode: (nodeId: string) => void;
    onUpdateNodeData: (
        nodeId: string,
        data: Record<string, unknown>
    ) => void;
}

function CanvasNodeInspector({
    selectedCanvasNodeId,
    onDeleteNode,
    onUpdateNodeData,
}: CanvasNodeInspectorProps) {
    const nodes = useNodes();

    const selectedNode = selectedCanvasNodeId
        ? nodes.find((node) => node.id === selectedCanvasNodeId)
        : undefined;

    const [speedInput, setSpeedInput] = useState("2");
    const [radiusInput, setRadiusInput] = useState("100");

    useEffect(() => {
        if (selectedNode?.data.variant === "patrol") {
            setSpeedInput(String(selectedNode.data.speed ?? 2));
        }
    }, [selectedNode?.id, selectedNode?.data.speed, selectedNode?.data.variant]);

    useEffect(() => {
        if (selectedNode?.data.variant === "patrol") {
            setRadiusInput(
                String(selectedNode.data.patrolRadius ?? 100)
            );
        }
    }, [
        selectedNode?.id,
        selectedNode?.data.patrolRadius,
        selectedNode?.data.variant,
    ]);

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

                    <div className="inspector-field">
                        <label htmlFor="patrol-speed">
                            Speed
                        </label>

                        <input
                            id="patrol-speed"
                            type="number"
                            min={0.1}
                            max={10}
                            step={0.1}
                            value={speedInput}
                            onChange={(event) => {
                                setSpeedInput(event.target.value);
                            }}
                            onBlur={() => {
                                const speed = Number(speedInput);

                                if (
                                    speedInput.trim() === "" ||
                                    !Number.isFinite(speed) ||
                                    speed < 0.1 ||
                                    speed > 10
                                ) {
                                    setSpeedInput(String(selectedNode.data.speed ?? 2));
                                    return;
                                }

                                onUpdateNodeData(selectedNode.id, { speed });
                            }}
                        />
                    </div>

                    <div className="inspector-field">
                        <label htmlFor="patrol-radius">
                            Patrol Radius
                        </label>

                        <input
                            id="patrol-radius"
                            type="number"
                            min={10}
                            max={500}
                            step={10}
                            value={radiusInput}
                            onChange={(event) => {
                                setRadiusInput(event.target.value);
                            }}
                            onBlur={() => {
                                const radius = Number(radiusInput);

                                if (
                                    radiusInput.trim() === "" ||
                                    !Number.isFinite(radius) ||
                                    radius < 10 ||
                                    radius > 500
                                ) {
                                    setRadiusInput(
                                        String(selectedNode.data.patrolRadius ?? 100)
                                    );
                                    return;

                                }

                                onUpdateNodeData(selectedNode.id, {
                                    patrolRadius: radius,
                                });
                            }}
                        />

                    </div>
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