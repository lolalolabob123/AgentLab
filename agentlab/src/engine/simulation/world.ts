import type { Position } from "./detection";

export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 600;

export const INITIAL_AGENT_POSITION: Position = {
    x: 300,
    y: 360,
};

export const INITIAL_PLAYER_POSITION: Position = {
    x: 750,
    y: 180,
};

export const DEFAULT_DETECTION_RANGE = 150;

export function worldToPercent(position: Position): Position {
    return {
        x: (position.x / WORLD_WIDTH) * 100,
        y: (position.y / WORLD_HEIGHT) * 100,
    };
}

export function percentToWorld(position: Position): Position {
    return {
        x: (position.x / 100) * WORLD_WIDTH,
        y: (position.y / 100) * WORLD_HEIGHT,
    };
}