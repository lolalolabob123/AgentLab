export type NodeCategoryType =
    | "control"
    | "condition"
    | "action";

export interface NodeDefinition {
    id: string;
    label: string;
    category: NodeCategoryType;
    description: string;
}