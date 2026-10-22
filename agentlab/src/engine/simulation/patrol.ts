import type {Position} from "./detection";

export function getPatrolTarget(
    center: Position,
    radius: number,
    angle: number
): Position {
    return {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
    };
}