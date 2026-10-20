import type { Position } from "./detection";
import { WORLD_WIDTH, WORLD_HEIGHT } from "./world";

export const CAMERA_ZOOM = 1.5;

export type Camera = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export function createCamera(
    zoom: number = CAMERA_ZOOM,
    center: Position = {
        x: WORLD_WIDTH / 2,
        y: WORLD_HEIGHT / 2,
    },
    aspectRatio: number = WORLD_WIDTH / WORLD_HEIGHT
): Camera {
    const height = WORLD_HEIGHT / zoom;
    const width = height * aspectRatio;

    return {
        x: center.x - width / 2,
        y: center.y - height / 2,
        width,
        height,
    };
}