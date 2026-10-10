import NodeCategory from "./NodeCategory";

type NodeLibraryProps = {
    selectedNodeId: string | null;
    onSelectNode: (id: string) => void;
    onAddNode: (id: string) => void;
}

function NodeLibrary({selectedNodeId, onSelectNode, onAddNode}: NodeLibraryProps) {
    return (
        <div className="node-library-content">
            <NodeCategory title="Control" category="control" selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} onAddNode={onAddNode} />

            <NodeCategory title="Conditions" category="condition" selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} onAddNode={onAddNode} />

            <NodeCategory title="Actions" category="action" selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} onAddNode={onAddNode} />
        </div>
    );
}

export default NodeLibrary;