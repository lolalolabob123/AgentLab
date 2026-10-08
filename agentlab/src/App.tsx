import { useState } from "react";
import {PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen} from "lucide-react";

function App() {

  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const [libraryWidth, setLibraryWidth] = useState(240);

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
          <aside 
          className="node-library"
          style={{width: `${libraryWidth}px`}}
          >
            Node Library
          </aside>
        )}

        <main className="editor">
          Behaviour Editor
        </main>

        {isInspectorOpen && (
                  <aside className="inspector">
          Inspector
        </aside>
        )}
      </div>

      <footer className="status-bar">
        Ready
      </footer>

    </div>
  );
}

export default App;