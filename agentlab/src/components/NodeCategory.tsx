import { useState } from "react";
import { ChevronDown, ChevronRight, GitBranch, ListOrdered, Eye, Footprints, Crosshair } from "lucide-react";
import { nodeDefinitions } from "../data/nodeDefinitions";
import type { NodeCategoryType } from "../types/node";


type NodeCategoryProps = {
    title: string;
    category: NodeCategoryType;
    selectedNodeId: string | null;
    onSelectNode: (id: string) => void;
};

const nodeIcons = {
    selector: GitBranch,
    sequence: ListOrdered,
    "can-see-player": Eye,
    patrol: Footprints,
    "chase-player": Crosshair,
};

function NodeCategory({
     title,
     category,
     selectedNodeId,
     onSelectNode,
}: NodeCategoryProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const nodes = nodeDefinitions.filter(
        (node) => node.category === category
    );

    return (
        <div className="node-category">
            <button
                className="category-toggle"
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((prev) => !prev)}
            >
                {isExpanded ? (
                    <ChevronDown size={16} />
                ) : (
                    <ChevronRight size={16} />
                )}

                <span>{title}</span>
            </button>

            {isExpanded && (
                <div className="category-content">
                    {nodes.map((node) => {
                        const Icon = nodeIcons[node.id as keyof typeof nodeIcons];

                        return (
                            <div
                                className={`node-item node-item--${node.category}`}
                                key={node.id}
                                onClick={() => onSelectNode(node.id)}
                                data-selected={selectedNodeId === node.id}
                            >
                                {Icon && <Icon size={16} className="node-icon" />}
                                <span>{node.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default NodeCategory;