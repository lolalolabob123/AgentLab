import NodeCategory from "./NodeCategory";

type NodeLibraryProps = {
    selectedNodeId: string | null;
    onSelectNode: (id: string) => void;
}

function NodeLibrary({selectedNodeId, onSelectNode}: NodeLibraryProps) {
    return (
        <div className="node-library-content">
            <NodeCategory title="Control" category="control" selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />

            <NodeCategory title="Conditions" category="condition" selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />

            <NodeCategory title="Actions" category="action" selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
        </div>
    );
}

export default NodeLibrary;