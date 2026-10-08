import type { NodeDefinition } from "../types/node";

type InspectorProps = {
    selectedNode: NodeDefinition | undefined;
};

function Inspector({selectedNode}: InspectorProps) {
    return (
        <div className="inspector-content">
            <h2>Inspector</h2>

            {selectedNode ? (
                <div className="inspector-details">
                    <h3>{selectedNode.label}</h3>

                    <span className="inspector-category">
                        {selectedNode.category}
                    </span>

                    <div className="inspector-section">
                        <h4>Description</h4>
                        <p>{selectedNode.description}</p>
                    </div>
                    </div>
            ) : (
                <p>No node selected</p>
            )}
        </div>
    );
}

export default Inspector;