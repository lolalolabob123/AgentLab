import type { Position } from "./detection";
import { getDistance } from "./detection";

export function moveTowards(
    current: Position,
    target: Position,
    speed: number,
    deltaTime: number
): Position {
    const distance = getDistance(current, target);

    if (distance === 0) {
        return current;
    }

    const maxMovement = speed * deltaTime;

    if (distance <= maxMovement) {
        return target;
    }

    const directionX = (target.x - current.x) / distance;
    const directionY = (target.y - current.y) / distance;

    return {
        x: current.x + directionX * maxMovement,
        y: current.y + directionY * maxMovement,
    };
}