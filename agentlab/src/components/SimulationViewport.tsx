import { useRef, useState, useLayoutEffect } from "react";
import type { PointerEvent } from "react";
import { canSeePlayer, getDistance } from "../engine/simulation/detection";
import type { Position } from "../engine/simulation/detection";
import {
    DEFAULT_DETECTION_RANGE,
    WORLD_WIDTH,
    WORLD_HEIGHT,
} from "../engine/simulation/world";
import SimulationWorld from "./SImulationWorld";
import { createCamera } from "../engine/simulation/camera";
import "./SimulationViewport.css";

type SimulationViewportProps = {
    agentPosition: Position;
    playerPosition: Position;
    onPlayerPositionChange: (position: Position) => void;
    isRunning: boolean;
};

export default function SimulationViewport({
    agentPosition,
    playerPosition,
    onPlayerPositionChange,
    isRunning,
}: SimulationViewportProps) {

    const playerDetected = canSeePlayer(
        agentPosition,
        playerPosition,
        DEFAULT_DETECTION_RANGE
    );

    const playerDistance = getDistance(
        agentPosition,
        playerPosition
    );

    const worldRef = useRef<HTMLDivElement>(null);


    const [aspectRatio, setAspectRatio] = useState(
        WORLD_WIDTH / WORLD_HEIGHT
    );

    useLayoutEffect(() => {
        const world = worldRef.current;
        if (!world) return;

        const updateSize = () => {
            const { width, height } = world.getBoundingClientRect();

            if (width > 0 && height > 0) {
                setAspectRatio(width / height);
            }
        };

        updateSize();

        const observer = new ResizeObserver(updateSize);
        observer.observe(world);

        return () => observer.disconnect();
    }, []);

    const camera = createCamera(
        undefined,
        undefined,
        aspectRatio
    );



    const updatePlayerPosition = (event: PointerEvent<HTMLDivElement>) => {
        const world = worldRef.current;
        if (!world) return;

        const rect = world.getBoundingClientRect();

        const x =
            camera.x +
            ((event.clientX - rect.left) / rect.width) * camera.width;

        const y =
            camera.y +
            ((event.clientY - rect.top) / rect.height) * camera.height;



        onPlayerPositionChange({
            x: Math.max(0, Math.min(WORLD_WIDTH, x)),
            y: Math.max(0, Math.min(WORLD_HEIGHT, y)),
        });

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
                <div className="simulation-header-right">
                    <span
                        className={`simulation-detection-status ${playerDetected ? "detected" : "not-detected"
                            }`}
                    >
                        {playerDetected ? "Player Detected" : "Player Not Detected"}
                    </span>

                    <span className="simulation-distance">
                        Distance: {playerDistance.toFixed(1)} / {DEFAULT_DETECTION_RANGE}
                    </span>

                    <span className="simulation-playback-status">
                        {isRunning ? "Running" : "Paused"}
                    </span>
                </div>
            </div>

            <div className="simulation-world-container">
                <div
                    ref={worldRef}
                    className="simulation-world"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                >
                    <SimulationWorld
                        agentPosition={agentPosition}
                        playerPosition={playerPosition}
                        camera={camera}
                    />
                </div>
            </div>

        </div>
    );
}