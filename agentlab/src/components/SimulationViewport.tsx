import "./SimulationViewport.css";

export default function SimulationViewport() {
    return (
        <div className="simulation-viewport">
            <div className="simulation-header">
                <span>AI Simulation</span>
                <span className="simulation-status">Paused</span>
            </div>

            <div className="simulation-world">
                <div className="simulation-agent" title="AI Agent" />
                <div className="simulation-player" title="Player" />
            </div>
        </div>
    );
}