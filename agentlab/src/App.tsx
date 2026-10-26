import { useCallback, useRef, useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Play, Pause, RotateCcw, ChevronRight, ChevronsDown } from "lucide-react";
import NodeLibrary from "./components/NodeLibrary";
import { nodeDefinitions } from "./data/nodeDefinitions";
import Inspector from "./components/Inspector";
import BehaviourEditor from "./components/BehaviourEditor";
import { ReactFlowProvider } from "@xyflow/react";
import CanvasNodeInspector from "./components/CanvasNodeInspector";
import SimulationViewport from "./components/SimulationViewport";
import type { Position } from "./engine/simulation/detection";
import { INITIAL_PLAYER_POSITION, INITIAL_AGENT_POSITION } from "./engine/simulation/world";
import type { BehaviourEditorHandle } from "./components/BehaviourEditor";
import { moveTowards } from "./engine/simulation/movement";
import { getPatrolTarget } from "./engine/simulation/patrol";
import { SIMULATION_CONFIG } from "./engine/simulation/config";
import type { SimulationHistoryEvent } from "./engine/simulation/historyTypes";
import ExecutionHistory from "./components/ExecutionHistory";

function App() {

  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const [libraryWidth, setLibraryWidth] = useState(240);
  const [inspectorWidth, setInspectorWidth] = useState(240);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedCanvasNodeId, setSelectedCanvasNodeId] = useState<string | null>(null);

  const [validationCounts, setValidationCounts] = useState({
    errors: 0,
    warnings: 0,
  })

  const [nodeToAdd, setNodeToAdd] = useState<{
    id: string;
    requestId: string;
  } | null>(null);

  const [nodeToDelete, setNodeToDelete] = useState<{
    id: string;
    requestId: string;
  } | null>(null);

  const [nodeDataUpdate, setNodeDataUpdate] = useState<{
    nodeId: string;
    data: Record<string, unknown>;
    requestId: string;
  } | null>(null);

  const [playerPosition, setPlayerPosition] = useState<Position>(
    INITIAL_PLAYER_POSITION
  );

  const [selectionSource, setSelectionSource] = useState<"library" | "canvas" | null>(null);

  const [simulationHeight, setSimulationHeight] = useState(260)

  const [agentPosition, setAgentPosition] = useState<Position>(
    INITIAL_AGENT_POSITION
  );

  const [patrolAngle, setPatrolAngle] = useState(0);

  const selectedNode = nodeDefinitions.find(
    (node) => node.id === selectedNodeId
  );

  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [activeBehaviourName, setActiveBehaviourName] =
    useState<string>("Idle");

  const [simulationHistory, setSimulationHistory] =
    useState<SimulationHistoryEvent[]>([]);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const behaviourEditorRef = useRef<BehaviourEditorHandle>(null);
  const simulationStepRef = useRef<(deltaTime?: number) => void>(() => { });
  const simulationTimeRef = useRef(0);
  const lastRecordedBehaviourRef = useRef("Idle");

  const activeBehaviourRef = useRef<{
    variant: string;
    data: Record<string, unknown>
  } | null>(null);

  const aiUpdateTimerRef = useRef(0);

  const handleAddNode = (id: string) => {
    setNodeToAdd({
      id,
      requestId: crypto.randomUUID()
    });
  };

  const handleSelectCanvasNode = (nodeId: string) => {
    setSelectedCanvasNodeId(nodeId);
    setSelectionSource("canvas");
  };

  const handleClearCanvasSelection = useCallback(() => {
    setSelectedCanvasNodeId(null);
    setSelectionSource(null);
  }, []);

  const handleSelectLibraryNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectionSource("library");
  }

  const handleLibraryResize = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (event.buttons !== 1) return;

    const workspace = event.currentTarget.parentElement;
    if (!workspace) return;

    const workspaceLeft = workspace.getBoundingClientRect().left;

    const newWidth = event.clientX - workspaceLeft;

    const clampedWidth = Math.max(
      180,
      Math.min(450, newWidth)
    );

    setLibraryWidth(clampedWidth);
  };

  const handleInspectorresize = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (event.buttons !== 1) return;

    const workspace = event.currentTarget.parentElement;
    if (!workspace) return;

    const workspaceRight =
      workspace.getBoundingClientRect().right;

    const newWidth = workspaceRight - event.clientX;

    const clampedWidth = Math.max(
      180,
      Math.min(450, newWidth)
    );

    setInspectorWidth(clampedWidth);
  };

  const handleSimulationResize = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (event.buttons !== 1) return;

    const center = event.currentTarget.parentElement;
    if (!center) return;

    const rect = center.getBoundingClientRect();

    const newHeight = rect.bottom - event.clientY;

    const clampedHeight = Math.max(
      180,
      Math.min(rect.height - 180, newHeight)
    );

    setSimulationHeight(clampedHeight);
  }

  const handleDeleteCanvasNode = (nodeId: string) => {
    setNodeToDelete({
      id: nodeId,
      requestId: crypto.randomUUID(),
    });
  };

  const handleUpdateNodeData = (
    nodeId: string,
    data: Record<string, unknown>
  ) => {
    setNodeDataUpdate({
      nodeId,
      data,
      requestId: crypto.randomUUID(),
    });
  };

  const handleResetSimulation = () => {
    setIsSimulationRunning(false);

    setAgentPosition({ ...INITIAL_AGENT_POSITION });
    setPlayerPosition({ ...INITIAL_PLAYER_POSITION });

    setPatrolAngle(0);
    setActiveBehaviourName("Idle");

    activeBehaviourRef.current = null;
    aiUpdateTimerRef.current = 0;

    behaviourEditorRef.current?.clearExecutionTrace();

    setSimulationHistory([]);
    simulationTimeRef.current = 0;
    lastRecordedBehaviourRef.current = "Idle";
  }

  const recordBehaviourChange = (
    behaviourName: string,
    deltaTime: number
  ) => {
    simulationTimeRef.current += deltaTime;

    if (lastRecordedBehaviourRef.current === behaviourName) {
      return;
    }

    lastRecordedBehaviourRef.current = behaviourName;

    const event: SimulationHistoryEvent = {
      id: crypto.randomUUID(),
      timestamp: simulationTimeRef.current,
      type: "behaviour-changed",
      message: behaviourName,
    };

    setSimulationHistory((previous) => [
      ...previous,
      event,
    ]);
  };

  const handleStepSimulation = (deltaTime: number = SIMULATION_CONFIG.manualStepDuration) => {

    if (!behaviourEditorRef.current?.canRunSimulation()) {
      setIsSimulationRunning(false);
      return;
    }

    const behaviour =
      behaviourEditorRef.current?.getActiveBehaviour();

    if (!behaviour) {
      setActiveBehaviourName("Idle");
      return;
    }

    const behaviourName =
      behaviour.variant === "chase-player"
        ? "Chasing Player"
        : behaviour.variant === "patrol"
          ? "Patrolling"
          : "Idle";

    setActiveBehaviourName((previous) =>
      previous === behaviourName ? previous : behaviourName
    );

    recordBehaviourChange(behaviourName, deltaTime);

    if (behaviour.variant === "chase-player") {

      const chaseSpeed =
        typeof behaviour.data.chaseSpeed === "number"
          ? behaviour.data.chaseSpeed
          : 4;

      const stopDistance =
        typeof behaviour.data.stopDistance === "number"
          ? behaviour.data.stopDistance
          : 25;

      // Scale Inspector speed into world units per second.
      const movementSpeed = chaseSpeed * SIMULATION_CONFIG.movementSpeedMultiplier;

      setAgentPosition((currentPosition) => {
        const distance = Math.hypot(
          playerPosition.x - currentPosition.x,
          playerPosition.y - currentPosition.y
        );

        // Stop when close enough to the player.
        if (distance <= stopDistance) {
          return currentPosition;
        }

        const nextPosition = moveTowards(
          currentPosition,
          playerPosition,
          movementSpeed,
          deltaTime
        );

        // Avoid moving inside the configured stopping distance.
        const remainingDistance = Math.hypot(
          playerPosition.x - nextPosition.x,
          playerPosition.y - nextPosition.y
        );

        if (remainingDistance < stopDistance) {
          return moveTowards(
            currentPosition,
            playerPosition,
            distance - stopDistance,
            1
          );
        }

        return nextPosition;
      });
    }

    if (behaviour.variant === "patrol") {
      const patrolSpeed =
        typeof behaviour.data.speed === "number"
          ? behaviour.data.speed
          : 2;
      const patrolRadius =
        typeof behaviour.data.patrolRadius === "number"
          ? behaviour.data.patrolRadius
          : 100;

      const target = getPatrolTarget(
        INITIAL_AGENT_POSITION,
        patrolRadius,
        patrolAngle
      );

      const movementSpeed = patrolSpeed * SIMULATION_CONFIG.movementSpeedMultiplier;

      const nextPosition = moveTowards(
        agentPosition,
        target,
        movementSpeed,
        deltaTime
      );

      setAgentPosition(nextPosition);

      const distanceToTarget = Math.hypot(
        target.x - nextPosition.x,
        target.y - nextPosition.y
      );

      if (distanceToTarget < 1) {
        setPatrolAngle((currentAngle) =>
          (currentAngle + Math.PI / 2) % (Math.PI * 2))
      };
    }
  };

  simulationStepRef.current = handleStepSimulation;

  useEffect(() => {
    if (!isSimulationRunning) {
      return;
    }

    let animationFrameId: number;
    let previousTime: number | null = null;

    const animate = (currentTime: number) => {
      if (previousTime === null) {
        previousTime = currentTime;
      }

      const deltaTime = Math.min(
        (currentTime - previousTime) / 1000,
        SIMULATION_CONFIG.maxDeltaTime
      );

      previousTime = currentTime;

      simulationStepRef.current(deltaTime);

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isSimulationRunning]);

  return (
    <div className="app">

      <header className="toolbar">
        <div className="toolbar-left">
          <span className="app-title">AgentLab</span>

          <button
            type="button"
            className="toolbar-button"
            onClick={() => setIsLibraryOpen((prev) => !prev)}
            aria-label={isLibraryOpen ? "Hide Node Library" : "Show Node Library"}
            title={isLibraryOpen ? "Hide Node Library" : "Show Node Library"}
          >
            {isLibraryOpen ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
          </button>
        </div>

        <div className="simulation-controls">
          <button
            type="button"
            className={`toolbar-button simulation-run-button ${isSimulationRunning ? "is-running" : ""
              }`}
            onClick={() => {
              if (isSimulationRunning) {
                setIsSimulationRunning(false);
                return;
              }

              if (!behaviourEditorRef.current?.canRunSimulation()) {
                return;
              }

              activeBehaviourRef.current = null;
              aiUpdateTimerRef.current = 0;

              setIsSimulationRunning(true);
            }}
            title={isSimulationRunning ? "Pause Simulation" : "Run Simulation"}
          >
            {isSimulationRunning ? (
              <Pause size={14} />
            ) : (
              <Play size={24} />
            )}
            <span>{isSimulationRunning ? "Pause" : "Run"}</span>
          </button>

          <button
            type="button"
            className="toolbar-button simulation-step-button"
            onClick={() => {
              activeBehaviourRef.current = null;
              aiUpdateTimerRef.current = 0;
              handleStepSimulation();
            }}
            disabled={isSimulationRunning}
            title="Advance simulation by 0.5 seconds"
          >
            Step
          </button>

          <button
            type="button"
            className="toolbar-button simulation-reset-button"
            onClick={handleResetSimulation}
            title="Reset simulation to initial state"
            aria-label="Reset Simulation"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>


        <button
          type="button"
          className="toolbar-button"
          onClick={() => setIsInspectorOpen((prev) => !prev)}
          aria-label={isInspectorOpen ? "Hide Inspector" : "Show Inspector"}
          title={isInspectorOpen ? "Hide Inspector" : "Show Inspector"}
        >
          {isInspectorOpen ? (
            <PanelRightClose size={18} />
          ) : (
            <PanelRightOpen size={18} />
          )}
        </button>
      </header>

      <ReactFlowProvider>
        <div className="workspace">
          {isLibraryOpen && (
            <>
              <aside
                className="node-library"
                style={{ width: `${libraryWidth}px` }}
              >
                <NodeLibrary
                  selectedNodeId={selectedNodeId}
                  onSelectNode={handleSelectLibraryNode}
                  onAddNode={handleAddNode}
                />
              </aside>

              <div
                className="resize-divider"
                onPointerDown={(event) => {
                  event?.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={handleLibraryResize}
                onPointerUp={(event) => {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }}
              />
            </>
          )}

          <main className="editor">
            <div className="workspace-center">
              <div className="workspace-editor">
                <BehaviourEditor
                  ref={behaviourEditorRef}
                  nodeToAdd={nodeToAdd}
                  nodeToDelete={nodeToDelete}
                  onSelectCanvasNode={handleSelectCanvasNode}
                  onClearCanvasSelection={handleClearCanvasSelection}
                  nodeDataUpdate={nodeDataUpdate}
                  playerPosition={playerPosition}
                  agentPosition={agentPosition}
                  onValidationChange={setValidationCounts}
                />
              </div>

              <div
                className="simulation-resize-divider"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={handleSimulationResize}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }}
              />
              <div
                className="workspace-simulation"
                style={{
                  height: simulationHeight,
                  flex: "none",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                <div style={{flex: 1, minHeight: 0}}>
                  <SimulationViewport
                    agentPosition={agentPosition}
                    playerPosition={playerPosition}
                      onPlayerPositionChange={setPlayerPosition}
                      isRunning={isSimulationRunning}
                      activeBehaviourName={activeBehaviourName}
                  />
                </div>

                <div className="execution-history-container">
                  <button
                    type="button"
                    className="execution-history-toggle"
                    onClick={() => setIsHistoryOpen((previous) => !previous)}
                    aria-expanded={isHistoryOpen}
                  >
                    {isHistoryOpen ? (
                      <ChevronsDown size={15} />
                    ) : (
                      <ChevronRight size={15} />
                    )}

                    <span>History</span>

                    <span className="execution-history-count">
                      {simulationHistory.length}
                    </span>
                  </button>

                  {isHistoryOpen && (
                    <ExecutionHistory events={simulationHistory} />
                  )}
                </div>

              </div>
            </div>
          </main>

          {isInspectorOpen && (
            <>
              <div
                className="inspector-resize-divider"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={handleInspectorresize}
                onPointerUp={(event) => {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }}
              />

              <aside
                className="inspector"
                style={{ width: `${inspectorWidth}px` }}
              >
                {selectionSource === "canvas" ? (
                  <CanvasNodeInspector
                    selectedCanvasNodeId={selectedCanvasNodeId}
                    onDeleteNode={handleDeleteCanvasNode}
                    onUpdateNodeData={handleUpdateNodeData}
                  />
                ) : (
                  <Inspector
                    selectedNode={selectedNode}
                  />
                )}
              </aside>
            </>
          )}
        </div>
      </ReactFlowProvider>

      <footer className="status-bar">
        <div className="status-bar-left">
          <span
            className={`status-indicator ${validationCounts.errors > 0
              ? "error"
              : isSimulationRunning
                ? "running"
                : "ready"
              }`}
          />

          <span>
            {validationCounts.errors > 0
              ? "Tree validation failed"
              : isSimulationRunning
                ? "Simulation running"
                : "Ready"}
          </span>
        </div>

        <div className="status-bar-right">
          <span className="status-error-count">
            {validationCounts.errors}{" "}
            {validationCounts.errors === 1 ? "error" : "errors"}
          </span>

          <span className="status-warning-count">
            {validationCounts.warnings}{" "}
            {validationCounts.warnings === 1 ? "warning" : "warnings"}
          </span>
        </div>
      </footer>

    </div>
  );
}

export default App;