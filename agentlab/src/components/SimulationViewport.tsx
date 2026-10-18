import {useRef, useState} from "react";
import type { PointerEvent } from "react";
import "./SimulationViewport.css";

type Position = {
    x: number;
    y: number;
};

export default function SimulationViewport() {
    const [playerPosition, setPlayerPosition] = useState<Position>({
        x: 75,
        y: 30,
    });

    const worldRef = useRef<HTMLDivElement>(null);

    const handleWorldClick = (event: PointerEvent<HTMLDivElement>) => {
        const world = worldRef.current;
        if (!world) return;

        const rect = world.getBoundingClientRect();

        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        setPlayerPosition({
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
        });
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
                onPointerDown={handleWorldClick}
            >
                <div className="simulation-agent" title="AI Agent" />

                <div 
                    className="simulation-player"
                    title="Player"
                    style={{
                        left: `${playerPosition.x}%`,
                        top: `${playerPosition.y}%`,
                    }}
                />
            </div>
        </div>
    );
}