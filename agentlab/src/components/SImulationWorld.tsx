import type { Position } from "../engine/simulation/detection";
import {
    DEFAULT_DETECTION_RANGE,
} from "../engine/simulation/world";

import type { Camera } from "../engine/simulation/camera";

type SimulationWorldProps = {
    agentPosition: Position;
    playerPosition: Position;
    camera: Camera;
};

export default function SimulationWorld({
    agentPosition,
    playerPosition,
    camera,
}: SimulationWorldProps) {

    return (
        <svg
            className="simulation-world-svg"
            viewBox={`${camera.x} ${camera.y} ${camera.width} ${camera.height}`}
            preserveAspectRatio="xMidYMid meet"
        >
            <circle
                cx={agentPosition.x}
                cy={agentPosition.y}
                r={DEFAULT_DETECTION_RANGE}
                fill="rgba(52, 211, 153, 0.05)"
                stroke="#34d399"
                strokeDasharray="8 6"
            />

            <circle
                cx={agentPosition.x}
                cy={agentPosition.y}
                r={12}
                fill="#10b981"
                stroke="#6ee7b7"
                strokeWidth={3}
            />

            <circle
                cx={playerPosition.x}
                cy={playerPosition.y}
                r={12}
                fill="#ef4444"
                stroke="#fca5a5"
                strokeWidth={3}
            />
        </svg>
    )
}