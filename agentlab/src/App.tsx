import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import NodeLibrary from "./components/NodeLibrary";

function App() {

  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const [libraryWidth, setLibraryWidth] = useState(240);
  const [inspectorWidth, setInspectorWidth] = useState(240);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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
  }

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
  }

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

      <div className="workspace">
        {isLibraryOpen && (
          <>
            <aside
              className="node-library"
              style={{ width: `${libraryWidth}px` }}
            >
              <NodeLibrary
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
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
          Behaviour Editor
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
              Inspector
            </aside>
          </>
        )}
      </div>

      <footer className="status-bar">
        Ready
      </footer>

    </div>
  );
}

export default App;