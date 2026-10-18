import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { Position } from "../engine/simulation/detection";
import {
    INITIAL_AGENT_POSITION,
    INITIAL_PLAYER_POSITION,
    worldToPercent,
    percentToWorld
} from "../engine/simulation/world";
import "./SimulationViewport.css";

export default function SimulationViewport() {
    const [playerPosition, setPlayerPosition] = useState<Position>(
        INITIAL_PLAYER_POSITION
    );

    const worldRef = useRef<HTMLDivElement>(null);

    const updatePlayerPosition = (event: PointerEvent<HTMLDivElement>) => {
        const world = worldRef.current;
        if (!world) return;

        const rect = world.getBoundingClientRect();

        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        const percentagePosition = {
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
        };

        setPlayerPosition(percentToWorld(percentagePosition));
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        updatePlayerPosition(event);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (event.buttons !== 1) return;

        updatePlayerPosition(event);
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    return (
        <div className="simulation-viewport">
            <div className="simulation-header">
                <span>AI Simulation</span>
                <span className="simulation-status">Paused</span>
            </div>

            <div
                ref={worldRef}
                className="simulation-world"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <div
                    className="simulation-detection-radius"
                    style={{
                        left: `${worldToPercent(INITIAL_AGENT_POSITION).x}%`,
                        top: `${worldToPercent(INITIAL_AGENT_POSITION).y}%`,
                    }}
                >
                    <div className="simulation-agent" title="AI Agent" />
                </div>
                <div
                    className="simulation-player"
                    title="Player"
                    style={{
                        left: `${worldToPercent(playerPosition).x}%`,
                        top: `${worldToPercent(playerPosition).y}%`,
                    }}
                />
            </div>
        </div>
    );
}