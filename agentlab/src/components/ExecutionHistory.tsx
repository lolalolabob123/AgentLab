import type { SimulationHistoryEvent } from "../engine/simulation/historyTypes";

type ExecutionHistoryProps = {
    events: SimulationHistoryEvent[];
}

export default function ExecutionHistory({
    events,
}: ExecutionHistoryProps) {
    return (
        <section className="execution-history">
            <div className="execution-history-header">
                <h3>Execution History</h3>
                <span>{events.length} events</span>
            </div>

            <div className="execution-history-list">
                {events.length === 0 ? (
                    <p className="execution-history-empty">
                        No events recorded yet.
                    </p>
                ) : (
                    [...events].reverse().map((event) => (
                        <div
                            key={event.id}
                            className={`execution-history-event ${event.type === "condition-changed"
                                    ? event.message.includes("Success")
                                        ? "is-condition-success"
                                        : "is-condition-failure"
                                    : event.message === "Chasing Player"
                                        ? "is-chasing"
                                        : event.message === "Patrolling"
                                            ? "is-patrolling"
                                            : ""
                                }`}
                        >
                            <span className="execution-history-time">
                                {event.timestamp.toFixed(1)}s
                            </span>

                            <span className="execution-history-message">
                                {event.message}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}