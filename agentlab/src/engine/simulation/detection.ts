export type Position = {
    x: number;
    y: number;
}

export function getDistance(
    a: Position,
    b: Position
): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    
    return Math.sqrt(dx * dx + dy * dy);
}

export function canSeePlayer(
    agentPosition: Position,
    playerPosition: Position,
    detectionRange: number
): boolean {
    return getDistance(
        agentPosition,
        playerPosition
    ) <= detectionRange
}