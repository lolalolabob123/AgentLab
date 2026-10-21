import { useCallback, useRef, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
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

function App() {

  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const [libraryWidth, setLibraryWidth] = useState(240);
  const [inspectorWidth, setInspectorWidth] = useState(240);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedCanvasNodeId, setSelectedCanvasNodeId] = useState<string | null>(null);

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

  const selectedNode = nodeDefinitions.find(
    (node) => node.id === selectedNodeId
  );

  const behaviourEditorRef = useRef<BehaviourEditorHandle>(null);

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



const handleStepSimulation = () => {
    const behaviour =
        behaviourEditorRef.current?.getActiveBehaviour();

    if (!behaviour) {
        console.log("No active AI behaviour");
        return;
    }

    console.log("Active AI behaviour:", behaviour.variant);

    if (behaviour.variant === "chase-player") {
        const deltaTime = 0.5;

        const chaseSpeed =
            typeof behaviour.data.chaseSpeed === "number"
                ? behaviour.data.chaseSpeed
                : 4;

        const stopDistance =
            typeof behaviour.data.stopDistance === "number"
                ? behaviour.data.stopDistance
                : 25;

        // Scale Inspector speed into world units per second.
        const movementSpeed = chaseSpeed * 25;

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
};



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

        <button
          type="button"
          className="toolbar-button simulation-step-button"
          onClick={handleStepSimulation}
          title="Advance simulation by 0.5 seconds"
        >
          Step
        </button>

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

              <div className="workspace-simulation"
                style={{ height: simulationHeight, flex: "none" }}
              >
                <SimulationViewport
                  agentPosition={agentPosition}
                  playerPosition={playerPosition}
                  onPlayerPositionChange={setPlayerPosition} />
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
        Ready
      </footer>

    </div>
  );
}

export default App;