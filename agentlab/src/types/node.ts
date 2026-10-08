export type NodeCategoryType =
    | "control"
    | "condition"
    | "action";

export interface nodeDefinition {
    id: string;
    label: string;
    category: NodeCategoryType;
}