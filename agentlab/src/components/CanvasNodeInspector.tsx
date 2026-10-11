import { useNodes } from "@xyflow/react";

type CanvasNodeInspectorProps = {
    selectedCanvasNodeId: string | null;
}

function CanvasNodeInspector({
    selectedCanvasNodeId,
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
        </div>
    );
}

export default CanvasNodeInspector;