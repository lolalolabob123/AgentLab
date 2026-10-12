import { useNodes } from "@xyflow/react";

type CanvasNodeInspectorProps = {
    selectedCanvasNodeId: string | null;
    onDeleteNode: (nodeId: string) => void;
}

function CanvasNodeInspector({
    selectedCanvasNodeId,
    onDeleteNode,
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