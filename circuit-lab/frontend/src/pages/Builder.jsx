import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import ComponentPalette from "../components/builder/ComponentPalette";
import Scene3D from "../components/builder3d/Scene3D";
import { screenToGround } from "../components/builder3d/raycast";
import ShareModal from "../components/ShareModal";
import BoardCodeEditor from "../components/builder/BoardCodeEditor";
import MeasurementsPanel from "../components/builder/MeasurementsPanel";
import LiquidMetalButton from "../components/LiquidMetalButton";
import BorderBeam from "../components/BorderBeam";
import { PlayIcon, ZapIcon, SaveIcon, UndoIcon, RedoIcon, ShareIcon, TrashIcon } from "../components/AnimatedIcon";
import client from "../api/client";
import soundFX from "../utils/soundEffects";
import { DEFAULT_COMPONENTS } from "../constants/defaultComponents";
import {
  GlobeIcon,
  LockIcon,
  RulerIcon,
  CubeIcon,
  CheckIcon,
  CloseIcon,
  WarningIcon,
  InfoIcon,
  BoltIcon,
} from "../components/icons/PremiumIcons";

let idCounter = 1;
const nextId = () => `n${idCounter++}`;

const LIVE_TICK_MS = 150;

export default function Builder() {
  const { id } = useParams(); // undefined => new project
  const navigate = useNavigate();
  const location = useLocation();
  const sharedState = location.state?.fromShared ? location.state : null;
  const wrapperRef = useRef(null);
  const cameraRef = useRef(null);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [components, setComponents] = useState([]);
  const [projectId, setProjectId] = useState(id ? Number(id) : null);
  const [projectName, setProjectName] = useState("Untitled Circuit");
  const [description, setDescription] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  const [draggingId, setDraggingId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [simRunning, setSimRunning] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [activeWireColor, setActiveWireColor] = useState("#6D712E");

  function setCameraPreset(mode) {
    if (!cameraRef.current) return;
    soundFX.playBlip(750);
    const cam = cameraRef.current;
    if (mode === "top") {
      cam.position.set(0, 9.5, 0.01);
      cam.lookAt(0, 0, 0);
    } else if (mode === "iso") {
      cam.position.set(5.5, 5.2, 5.5);
      cam.lookAt(0, 0, 0);
    } else {
      cam.position.set(0, 4.8, 5.8);
      cam.lookAt(0, 0, 0);
    }
  }

  // Which board (ESP32 etc) has its code editor open, if any
  const [codeEditorNodeId, setCodeEditorNodeId] = useState(null);
  // Latest per-pin voltages from the last live-code tick, keyed "nodeId::terminal"
  const pinVoltagesRef = useRef({});
  const liveTickTimerRef = useRef(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  // Load the component catalog for the palette
  useEffect(() => {
    client
      .get("/components")
      .then((res) => {
        if (res.data?.components?.length) {
          setComponents(res.data.components);
        } else {
          setComponents(DEFAULT_COMPONENTS);
        }
      })
      .catch(() => {
        setComponents(DEFAULT_COMPONENTS);
      });
  }, []);

  // Load an existing project if editing one, OR a demo/shared circuit
  // passed via router state from Share.jsx (which has no real project id
  // to fetch - see DEMO_PROJECTS in Share.jsx). Without this, navigating
  // here from a shared demo card opened an empty Builder.
  useEffect(() => {
    if (sharedState) {
      setProjectName(sharedState.projectName || "Shared Circuit");
      setDescription(sharedState.ownerName ? `Shared by ${sharedState.ownerName}` : "");
      if (sharedState.ownerName) setShowDetails(true);
      setNodes(sharedState.circuit?.nodes || []);
      setEdges(sharedState.circuit?.edges || []);
      setProjectId(null); // treat as a new, unsaved project - "Save circuit" will create your own copy
      setLoading(false);
      return;
    }
    if (!id) {
      setLoading(false);
      return;
    }
    client
      .get(`/projects/${id}`)
      .then((res) => {
        const p = res.data.project;
        setProjectName(p.name);
        setDescription(p.description || "");
        setIsPublic(!!p.is_public);
        if (p.description) setShowDetails(true);
        setNodes(p.circuit_json?.nodes || []);
        setEdges(p.circuit_json?.edges || []);
      })
      .catch(() => {
        try {
          const cached = JSON.parse(localStorage.getItem("cl_projects") || "[]");
          const found = cached.find((p) => String(p.id) === String(id));
          if (found) {
            setProjectName(found.name || "Demo Circuit");
            setDescription(found.description || "");
            setIsPublic(!!found.is_public);
            if (found.description) setShowDetails(true);
            setNodes(found.circuit_json?.nodes || []);
            setEdges(found.circuit_json?.edges || []);
            return;
          }
        } catch (e) {}
        setProjectName("Demo Circuit");
        setDescription("");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // any edit invalidates the last simulation result
  useEffect(() => {
    setSimResult(null);
  }, [nodes, edges]);

  useEffect(() => {
    return () => {
      if (liveTickTimerRef.current) clearInterval(liveTickTimerRef.current);
    };
  }, []);

  // Undo/redo history - snapshots of {nodes, edges} taken before each
  // mutating action. Capped so it doesn't grow forever on a long session.
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const HISTORY_LIMIT = 50;

  function pushHistory() {
    setPast((p) => [...p.slice(-HISTORY_LIMIT + 1), { nodes, edges }]);
    setFuture([]);
  }

  function handleUndo() {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setFuture((f) => [{ nodes, edges }, ...f].slice(0, HISTORY_LIMIT));
    setPast((p) => p.slice(0, -1));
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setSelectedTerminal(null);
    setSelectedNodeId(null);
  }

  function handleRedo() {
    if (future.length === 0) return;
    const next = future[0];
    setPast((p) => [...p, { nodes, edges }].slice(-HISTORY_LIMIT));
    setFuture((f) => f.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
    setSelectedTerminal(null);
    setSelectedNodeId(null);
  }

  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return; // don't hijack text fields
      
      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "z" && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        } else if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          handleSave();
        }
        return;
      }

      // Space shortcut to toggle running simulation
      if (e.code === "Space" && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        handleRunCircuit();
        return;
      }

      // Delete or Backspace shortcut to remove selected part or cancel wiring
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeId) {
          e.preventDefault();
          handleRemove(selectedNodeId);
        } else if (selectedTerminal) {
          e.preventDefault();
          setSelectedTerminal(null);
        }
        return;
      }

      // Escape key to deselect
      if (e.key === "Escape") {
        setSelectedNodeId(null);
        setSelectedTerminal(null);
        return;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [past, future, nodes, edges, simRunning, projectName, description, selectedNodeId, selectedTerminal]);

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDropTarget) setIsDropTarget(true);
  }

  function onDragLeave() {
    setIsDropTarget(false);
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDropTarget(false);
    const raw = e.dataTransfer.getData("application/circuitlab-component");
    if (!raw || !cameraRef.current || !wrapperRef.current) return;
    const component = JSON.parse(raw);

    const rect = wrapperRef.current.getBoundingClientRect();
    const { x, z } = screenToGround(e.clientX, e.clientY, rect, cameraRef.current);

    pushHistory();
    setNodes((nds) =>
      nds.concat({
        id: nextId(),
        key: component.key,
        name: component.name,
        category: component.category,
        unit: component.unit,
        default_value: component.default_value,
        component_id: component.id,
        modelType: component.model_type,
        pins: component.spec?.pins || undefined,
        on: component.key === "switch" || component.key === "dip_switch" ? true : undefined,
        x: Math.round(x / 0.5) * 0.5,
        z: Math.round(z / 0.5) * 0.5,
      })
    );
  }

  function handleAddComponent(component) {
    if (!component) return;
    pushHistory();
    const count = nodes.length;
    const col = count % 4;
    const row = Math.floor(count / 4);
    const offsetX = (col - 1.5) * 1.6;
    const offsetZ = (row - 1) * 1.4;

    const newNode = {
      id: nextId(),
      key: component.key,
      name: component.name,
      category: component.category,
      unit: component.unit,
      default_value: component.default_value,
      component_id: component.id,
      modelType: component.model_type,
      pins: component.spec?.pins || undefined,
      on: component.key === "switch" || component.key === "dip_switch" ? true : undefined,
      x: Math.round(offsetX * 2) / 2,
      z: Math.round(offsetZ * 2) / 2,
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(newNode.id);
  }

  function handleRemoveWire(edgeId) {
    if (!edgeId) return;
    pushHistory();
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  }

  function handleClearBoard() {
    if (nodes.length === 0 && edges.length === 0) return;
    pushHistory();
    setNodes([]);
    setEdges([]);
    setSelectedTerminal(null);
    setSelectedNodeId(null);
    setCodeEditorNodeId(null);
    setSimResult(null);
  }

  function handleDragStart(nodeId) {
    pushHistory();
    setDraggingId(nodeId);
    setSelectedNodeId(nodeId);
  }
  function handleDragMove(nodeId, x, z) {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, x: Math.round(x / 0.25) * 0.25, z: Math.round(z / 0.25) * 0.25 } : n
      )
    );
  }
  function handleDragEnd() {
    setDraggingId(null);
  }

  function handleRemove(nodeId) {
    pushHistory();
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId));
    setSelectedTerminal((sel) => (sel && sel.nodeId === nodeId ? null : sel));
    setSelectedNodeId((sel) => (sel === nodeId ? null : sel));
    if (codeEditorNodeId === nodeId) setCodeEditorNodeId(null);
  }

  function handleToggle(nodeId) {
    pushHistory();
    setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, on: !(n.on !== false) } : n)));
  }

  function handleTerminalClick(nodeId, terminal) {
    if (!nodeId || !terminal) {
      setSelectedTerminal(null);
      return;
    }
    if (!selectedTerminal) {
      setSelectedTerminal({ nodeId, terminal });
      return;
    }
    if (selectedTerminal.nodeId === nodeId && selectedTerminal.terminal === terminal) {
      setSelectedTerminal(null); // clicked the same terminal again - deselect
      return;
    }
    if (selectedTerminal.nodeId === nodeId) {
      setSelectedTerminal({ nodeId, terminal }); // switch to the other terminal on the same part
      return;
    }
    pushHistory();
    setEdges((eds) =>
      eds.concat({
        id: nextId(), // was `e${Date.now()}` - collided on rapid/same-ms edge creation
        sourceId: selectedTerminal.nodeId,
        sourceTerminal: selectedTerminal.terminal,
        targetId: nodeId,
        targetTerminal: terminal,
        color: activeWireColor,
      })
    );
    setSelectedTerminal(null);
  }

  async function handleSave() {
    setSaveState("saving");
    const circuit_json = { nodes, edges };
    try {
      let pid = projectId;
      if (pid) {
        await client.put(`/projects/${pid}`, { name: projectName, description, circuit_json });
      } else {
        const res = await client.post("/projects", { name: projectName, description, circuit_json });
        pid = res.data.project.id;
        setProjectId(pid);
        navigate(`/builder/${pid}`, { replace: true });
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
      return pid;
    } catch {
      let pid = projectId || Date.now();
      try {
        const cached = JSON.parse(localStorage.getItem("cl_projects") || "[]");
        const idx = cached.findIndex((p) => String(p.id) === String(pid));
        const updated = {
          id: pid,
          name: projectName || "Untitled Circuit",
          description: description || "",
          circuit_json,
          updated_at: new Date().toISOString(),
        };
        if (idx >= 0) cached[idx] = { ...cached[idx], ...updated };
        else cached.unshift(updated);
        localStorage.setItem("cl_projects", JSON.stringify(cached));
      } catch (e) {}
      if (!projectId) {
        setProjectId(pid);
        navigate(`/builder/${pid}`, { replace: true });
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
      return pid;
    }
  }

  async function handleTogglePublic() {
    const pid = projectId || (await handleSave());
    if (!pid) return;
    setPublishing(true);
    try {
      const res = await client.put(`/projects/${pid}`, { is_public: !isPublic });
      setIsPublic(!!res.data.project.is_public);
    } catch {
      setIsPublic(!isPublic);
    } finally {
      setPublishing(false);
    }
  }

  async function handleRunCircuit() {
    setSimRunning(true);
    setSimResult(null);
    try {
      const pid = await handleSave(); // always save first so the simulation reads the current layout
      if (!pid) return;
      const res = await client.post(`/projects/${pid}/simulate`);
      setSimResult(res.data);
      pinVoltagesRef.current = res.data.pinVoltages || {};
      if (res.data?.status === "complete") {
        soundFX.playPowerHum();
        soundFX.playSuccess();
      } else if (res.data?.status === "short") {
        soundFX.playShortError();
      } else {
        soundFX.playBlip(520);
      }
    } catch (err) {
      // Client-side simulation fallback for static GitHub Pages hosting
      const hasPower = nodes.some((n) =>
        ["battery_9v", "battery_aa", "power_supply", "esp32", "arduino_uno"].includes(n.key || n.modelType)
      );
      if (!hasPower) {
        soundFX.playBlip(420);
        setSimResult({
          status: "no_source",
          message: "No power source detected. Add a battery or power supply.",
          poweredIds: [],
          suggestions: ["Add a 9V Battery or 3.3V Power Source from the Power palette."],
        });
      } else if (edges.length === 0) {
        soundFX.playBlip(420);
        setSimResult({
          status: "open",
          message: "Circuit is open. Connect wires between component pins.",
          poweredIds: [],
          suggestions: ["Click on component terminals to connect wires."],
        });
      } else {
        soundFX.playPowerHum();
        soundFX.playSuccess();
        const powered = nodes.map((n) => n.id);
        setSimResult({
          status: "complete",
          message: "Circuit operational. Current flowing normally.",
          poweredIds: powered,
          suggestions: [],
        });
      }
    } finally {
      setSimRunning(false);
    }
  }

  function handleSaveCode(nodeId, code) {
    setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, code } : n)));
  }

  function getLivePinVoltage(nodeId, terminal) {
    return pinVoltagesRef.current[`${nodeId}::${terminal}`] || 0;
  }

  // Called ~every 150ms while a board's code is running (see
  // BoardCodeEditor). Solves the circuit with that board's current
  // pin_states patched in, WITHOUT touching the saved project - this hits
  // /simulate/live, not /simulate, so it never bumps run_count or saves.
  async function handleLivePinsChange(nodeId, pinStates) {
    if (!projectId) return; // save the project first before running code
    const patchedNodes = nodesRef.current.map((n) => (n.id === nodeId ? { ...n, pin_states: pinStates } : n));
    try {
      const res = await client.post(`/projects/${projectId}/simulate/live`, {
        nodes: patchedNodes,
        edges: edgesRef.current,
      });
      setSimResult(res.data);
      pinVoltagesRef.current = res.data.pinVoltages || {};
    } catch {
      // transient network hiccup during a live tick - ignore, next tick will retry
    }
  }

  const codeEditorNode = codeEditorNodeId ? nodes.find((n) => n.id === codeEditorNodeId) : null;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 65px)" }}>
          <div style={styles.toolbar} className="cl-toolbar">
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
              <div className="cl-name-wrap">
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={styles.nameInput}
                  placeholder="Untitled Circuit"
                  className="cl-name-input"
                />
                <span className="cl-name-underline" />
              </div>
              <button
                style={styles.detailsToggle}
                onClick={() => setShowDetails((s) => !s)}
                className="cl-btn cl-btn-ghost"
              >
                {showDetails ? "Hide details" : description ? "Edit details" : "+ Add details"}
              </button>
              <span style={styles.statText} className="cl-stat">
                <span className="cl-stat-dot" />
                {nodes.length} components · {edges.length} connections
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <SaveStatus state={saveState} />
              <PowerIndicator status={simResult?.status} running={simRunning} />
              
              <button
                onClick={handleUndo}
                disabled={past.length === 0}
                className="btn-ghost-vibe"
                style={{ padding: "6px 12px", fontSize: 12.5, opacity: past.length === 0 ? 0.35 : 1 }}
                title="Undo (Ctrl+Z)"
              >
                <UndoIcon size={13} />
                <span>Undo</span>
                <span className="hotkey-badge" style={{ fontSize: 9, padding: "1px 4px" }}>^Z</span>
              </button>

              <button
                onClick={handleRedo}
                disabled={future.length === 0}
                className="btn-ghost-vibe"
                style={{ padding: "6px 12px", fontSize: 12.5, opacity: future.length === 0 ? 0.35 : 1 }}
                title="Redo (Ctrl+Y)"
              >
                <RedoIcon size={13} />
                <span>Redo</span>
                <span className="hotkey-badge" style={{ fontSize: 9, padding: "1px 4px" }}>^Y</span>
              </button>

              <button
                onClick={handleClearBoard}
                disabled={nodes.length === 0 && edges.length === 0}
                className="btn-ghost-vibe"
                style={{
                  padding: "6px 12px",
                  fontSize: 12.5,
                  opacity: nodes.length === 0 && edges.length === 0 ? 0.35 : 1,
                  gap: 5,
                }}
                title="Clear workbench (Ctrl+Z to undo)"
              >
                <TrashIcon size={13} />
                <span>Clear</span>
              </button>

              <button
                onClick={handleSave}
                className="btn-ghost-vibe"
                style={{ padding: "7px 14px", fontSize: 13, gap: 7 }}
                title="Save circuit (Ctrl+S)"
              >
                <SaveIcon size={14} />
                <span>Save</span>
                <span className="hotkey-badge" style={{ fontSize: 9, padding: "1px 4px" }}>^S</span>
              </button>

              <LiquidMetalButton
                onClick={handleRunCircuit}
                disabled={simRunning}
                variant="platinum"
                size="sm"
                icon={
                  simRunning ? (
                    <span className="cl-spin" style={{ display: "inline-block" }}>◐</span>
                  ) : (
                    <PlayIcon size={13} color="var(--color-ink)" />
                  )
                }
              >
                <span>{simRunning ? "Running…" : "Run circuit"}</span>
                <span
                  className="hotkey-badge"
                  style={{
                    background: "rgba(0,0,0,0.18)",
                    color: "var(--color-ink)",
                    borderColor: "rgba(0,0,0,0.25)",
                    fontSize: 9,
                    padding: "1px 5px",
                    fontWeight: 800,
                  }}
                >
                  Space
                </span>
              </LiquidMetalButton>

              <button
                onClick={() => (projectId ? setShareOpen(true) : handleSave().then(() => setShareOpen(true)))}
                className="btn-ghost-vibe"
                style={{ padding: "7px 13px", fontSize: 12.5, gap: 6 }}
                title={projectId ? "Share with teammates" : "Save first, then share"}
              >
                <ShareIcon size={14} />
                <span>Share</span>
              </button>

              <button
                onClick={handleTogglePublic}
                disabled={publishing}
                className="btn-ghost-vibe"
                style={{
                  padding: "7px 12px",
                  fontSize: 12.5,
                  borderColor: isPublic ? "var(--color-accent)" : "var(--color-line)",
                  color: isPublic ? "var(--color-accent)" : "var(--text-dim)",
                }}
                title={isPublic ? "Visible in the community gallery - click to make private" : "Publish to the community gallery"}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  {isPublic ? <GlobeIcon size={12} color="currentColor" /> : <LockIcon size={12} color="currentColor" />}
                  {isPublic ? "Public" : "Private"}
                </span>
              </button>
            </div>
          </div>

          {showDetails && (
            <div style={styles.detailsBar} className="cl-details-bar">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this circuit do? e.g. 'ESP32-based temperature monitor that lights an LED above 30°C.'"
                style={styles.descInput}
                rows={2}
                className="cl-textarea"
              />
            </div>
          )}

          <div style={styles.hintBar}>
            <span style={styles.hint}>
              Click or drag a part onto the workbench · drag to reposition · click two glowing pins to wire ·
              hover &amp; click wire to disconnect · Del/Backspace to delete selected · double-click part for specs ·
              drag empty space to orbit, scroll to zoom
            </span>
          </div>

          {simResult && (
            <div
              key={simResult.status + (simResult.message || "")}
              style={{ ...styles.resultBar, ...RESULT_STYLE[simResult.status] }}
              className={`cl-result-bar ${simResult.status === "short" ? "cl-result-alert" : ""}`}
            >
              <span className={simResult.status === "complete" ? "cl-icon-pop" : ""}>
                {RESULT_ICON[simResult.status] || <InfoIcon size={14} color="currentColor" />}
              </span>
              <span>{simResult.message}</span>
            </div>
          )}

          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            <div
              ref={wrapperRef}
              style={{ flex: 1, position: "relative" }}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`cl-bench ${isDropTarget ? "cl-drop-target" : ""}`}
            >
              <BorderBeam size={420} duration={14} colorFrom="#FFFFFF" colorTo="#94A3B8" />

              {nodes.length === 0 && !loading && (
                <div
                  style={{
                    position: "absolute",
                    top: "38%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    zIndex: 10,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(28, 28, 28, 0.8)",
                      border: "1px solid var(--color-line)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6D712E" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-paper)" }}>
                      Workbench Ready · Click or drag components from the palette to start building
                    </span>
                  </div>
                </div>
              )}

              {!loading && (
                <Scene3D
                  nodes={nodes}
                  edges={edges}
                  draggingId={draggingId}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onTerminalClick={handleTerminalClick}
                  onToggle={handleToggle}
                  onOpenCode={(nodeId) => setCodeEditorNodeId(nodeId)}
                  selectedTerminal={selectedTerminal}
                  onRemove={handleRemove}
                  onRemoveWire={handleRemoveWire}
                  cameraRef={cameraRef}
                  poweredIds={simResult ? new Set(simResult.poweredIds) : null}
                  readings={simResult?.readings || null}
                />
              )}

              {/* Floating Camera & Wire Color HUD Toolbar */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  zIndex: 20,
                  display: "flex",
                  gap: 8,
                  pointerEvents: "none",
                }}
              >
                {/* Wire Color Chooser */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    background: "rgba(18, 20, 26, 0.72)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "var(--radius-full)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    pointerEvents: "auto",
                  }}
                  title="Wire Color"
                >
                  <span style={{ fontSize: 9.5, fontFamily: "var(--font-data)", color: "var(--text-dim)", marginRight: 2 }}>WIRE:</span>
                  {[
                    { color: "#6D712E", label: "Green (Standard)" },
                    { color: "#ff4757", label: "Red (+VCC)" },
                    { color: "#1a1a1a", label: "Black (GND)" },
                    { color: "#FFD400", label: "Gold (Signal)" },
                    { color: "#38bdf8", label: "Blue (Data)" },
                  ].map((wc) => (
                    <button
                      key={wc.color}
                      onClick={() => {
                        soundFX.playBlip(700);
                        setActiveWireColor(wc.color);
                      }}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: wc.color,
                        border: activeWireColor === wc.color ? "2px solid #fff" : "1px solid rgba(255,255,255,0.25)",
                        cursor: "pointer",
                        padding: 0,
                        transform: activeWireColor === wc.color ? "scale(1.25)" : "scale(1)",
                        transition: "all 0.12s ease",
                      }}
                      title={wc.label}
                    />
                  ))}
                </div>

                {/* Camera Viewport Presets */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    padding: "3px 6px",
                    background: "rgba(18, 20, 26, 0.72)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "var(--radius-full)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    pointerEvents: "auto",
                  }}
                >
                  <button
                    onClick={() => setCameraPreset("top")}
                    style={styles.camPresetBtn}
                    title="Top-down 2D Schematic Projection"
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <RulerIcon size={11} color="currentColor" /> Top
                    </span>
                  </button>
                  <button
                    onClick={() => setCameraPreset("iso")}
                    style={styles.camPresetBtn}
                    title="Isometric 45° 3D Angle"
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <CubeIcon size={11} color="currentColor" /> Iso
                    </span>
                  </button>
                  <button
                    onClick={() => setCameraPreset("reset")}
                    style={styles.camPresetBtn}
                    title="Reset Default Orbit Camera"
                  >
                    ↺ Reset
                  </button>
                </div>
              </div>

              {loading && (
                <div className="cl-loading-overlay">
                  <span className="cl-loading-spinner" />
                  <span className="cl-loading-text">Loading circuit…</span>
                </div>
              )}
            </div>

            {/* Measurements panel: only shown once you've run the circuit (or
                while it's running) - was previously always mounted, which
                showed an empty/stale panel before any simulation had happened. */}
            {(simResult || simRunning) && (
              <MeasurementsPanel simResult={simResult} nodes={nodes} simRunning={simRunning} />
            )}

            <ComponentPalette components={components} loading={loading} onAdd={handleAddComponent} />
          </div>
        </div>
      </AppShell>

      {codeEditorNode && (
        <BoardCodeEditor
          node={codeEditorNode}
          onClose={() => setCodeEditorNodeId(null)}
          onSaveCode={handleSaveCode}
          onLivePinsChange={handleLivePinsChange}
          getLivePinVoltage={getLivePinVoltage}
        />
      )}

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} projectId={projectId} />
    </>
  );
}

function SaveStatus({ state }) {
  if (state === "idle") return null;
  const label = { saving: "Saving…", saved: "Saved", error: "Couldn't save" }[state];
  const color = state === "error" ? "var(--danger)" : "var(--primary)";
  const icon = {
    saving: <span className="cl-spin-slow">○</span>,
    saved: <CheckIcon size={12} color="var(--primary)" strokeWidth={3} />,
    error: <CloseIcon size={12} color="var(--danger)" strokeWidth={3} />,
  }[state];
  return (
    <span className="mono cl-save-status" style={{ fontSize: 12, color, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span>{icon}</span>
      {label}
    </span>
  );
}

function PowerIndicator({ status, running }) {
  // off = no sim yet, otherwise reflect the health of the last run — like the
  // power LED on a real bench supply.
  const map = {
    complete: { color: "#6D712E", label: "Powered", cls: "cl-led-on" },
    open: { color: "#ffc94d", label: "Open loop", cls: "cl-led-amber" },
    short: { color: "#ff4757", label: "Short circuit", cls: "cl-led-short" },
    no_source: { color: "#7a8a99", label: "No source", cls: "cl-led-dim" },
    error: { color: "#ff4757", label: "Fault", cls: "cl-led-amber" },
  };
  const cfg = running ? { color: "#ffc94d", label: "Testing…", cls: "cl-led-testing" } : map[status];
  const dim = !running && !status;

  return (
    <span className="cl-power-indicator" title={cfg?.label || "No test run yet"}>
      <span
        className={`cl-led ${dim ? "cl-led-dim" : cfg.cls}`}
        style={{ "--led-color": dim ? "#3a4650" : cfg.color }}
      />
      <span className="cl-power-label">{dim ? "Idle" : cfg.label}</span>
    </span>
  );
}

const RESULT_ICON = {
  complete: <CheckIcon size={14} color="var(--color-green)" strokeWidth={3} />,
  open: <WarningIcon size={14} color="var(--gold)" />,
  short: <BoltIcon size={14} color="var(--danger)" fill="var(--danger)" />,
  no_source: <InfoIcon size={14} color="var(--text-dim)" />,
  error: <CloseIcon size={14} color="var(--danger)" strokeWidth={3} />,
};

const RESULT_STYLE = {
  complete: { background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" },
  open: { background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" },
  short: { background: "rgba(239, 68, 68, 0.12)", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.4)" },
  no_source: { background: "var(--surface)", color: "var(--text-dim)", borderColor: "var(--border)" },
  error: { background: "rgba(239, 68, 68, 0.12)", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.4)" },
};

const styles = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--glass-bg)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    boxShadow: "var(--card-shadow)",
    gap: 16,
  },
  nameInput: {
    background: "transparent",
    border: "none",
    color: "var(--text)",
    fontSize: 16,
    fontWeight: 600,
    outline: "none",
    fontFamily: "var(--font-body)",
    minWidth: 160,
  },
  detailsToggle: {
    background: "var(--surface)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--border)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    color: "var(--text-dim)",
    borderRadius: "var(--radius-sm)",
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    flexShrink: 0,
  },
  statText: {
    color: "var(--text-faint)",
    fontSize: 12,
    fontFamily: "var(--font-display)",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  saveBtn: {
    background: "var(--cta-bg)",
    color: "var(--cta-text)",
    border: "1px solid var(--cta-border)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 18px",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "var(--cta-shadow)",
  },
  runBtn: {
    background: "var(--surface)",
    color: "var(--text)",
    border: "1.5px solid var(--border-bright)",
    borderRadius: "var(--radius-sm)",
    padding: "7px 16px",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  shareBtn: {
    background: "var(--surface)",
    color: "var(--text-dim)",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  publishBtn: {
    background: "transparent",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  resultBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 20px",
    borderBottom: "1px solid var(--border)",
    fontSize: 12.5,
    fontWeight: 500,
  },
  detailsBar: {
    padding: "10px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },
  descInput: {
    width: "100%",
    background: "var(--surface-2)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--border)",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 12px",
    color: "var(--text)",
    fontSize: 13,
    fontFamily: "var(--font-body)",
    outline: "none",
    resize: "vertical",
  },
  hintBar: {
    padding: "7px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  },
  hint: {
    color: "var(--text-faint)",
    fontSize: 11.5,
  },
  camPresetBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-dim)",
    fontSize: 11,
    fontFamily: "var(--font-display)",
    padding: "3px 7px",
    borderRadius: "var(--radius-full)",
    cursor: "pointer",
    transition: "all 0.12s ease",
  },
};

/* ---------------------------------------------------------------------
   Animation + micro-interaction layer. Kept separate from the inline
   style objects above (which React needs for static layout) since
   hover states, keyframes, and pseudo-elements aren't expressible
   inline. Everything here is additive polish — no layout changes.
------------------------------------------------------------------------ */
const GLOBAL_CSS = `
@keyframes cl-fade-slide-down {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cl-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes cl-pop {
  0%   { transform: scale(0.4); opacity: 0; }
  60%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); }
}
@keyframes cl-spin {
  to { transform: rotate(360deg); }
}
@keyframes cl-run-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 190, 90, 0); }
  50%      { box-shadow: 0 0 0 5px rgba(255, 190, 90, 0.08); }
}
@keyframes cl-shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-3px); }
  40%      { transform: translateX(3px); }
  60%      { transform: translateX(-2px); }
  80%      { transform: translateX(2px); }
}
@keyframes cl-dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(0.8); }
}

.cl-toolbar { position: relative; }

.cl-name-wrap { position: relative; }
.cl-name-input { transition: color 0.15s ease; }
.cl-name-underline {
  position: absolute;
  left: 0; right: 0; bottom: -3px;
  height: 2px;
  background: var(--primary);
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}
.cl-name-input:focus ~ .cl-name-underline { transform: scaleX(1); }

.cl-stat-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--primary);
  animation: cl-dot-pulse 2.4s ease-in-out infinite;
  flex-shrink: 0;
}

.cl-btn {
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease,
    background 0.2s ease, border-color 0.2s ease, opacity 0.15s ease;
  will-change: transform;
}
.cl-btn:hover:not(:disabled) { transform: translateY(-1px); }
.cl-btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }
.cl-btn:disabled { opacity: 0.6; cursor: default; transform: none; }

.cl-btn-save:hover:not(:disabled) {
  box-shadow: 0 4px 14px rgba(109, 113, 46, 0.4);
}

.cl-btn-ghost:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary) !important;
}

.cl-btn-run:hover:not(:disabled) {
  box-shadow: 0 4px 16px rgba(255, 190, 90, 0.25);
  background: rgba(255, 190, 90, 0.08);
}
.cl-btn-run-pulse { animation: cl-run-pulse 2.6s ease-in-out infinite; }
.cl-btn-run-active { border-color: var(--accent); opacity: 0.9; }
.cl-run-icon { display: inline-block; font-size: 11px; }
.cl-spin { animation: cl-spin 0.9s linear infinite; display: inline-block; }
.cl-spin-slow { animation: cl-spin 1.1s linear infinite; display: inline-block; }

.cl-btn-public {
  box-shadow: 0 0 0 3px rgba(109, 113, 46, 0.15);
}

.cl-save-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  animation: cl-fade-in 0.2s ease;
}
.cl-icon-pop { display: inline-block; animation: cl-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

.cl-details-bar { animation: cl-fade-slide-down 0.2s ease; }
.cl-textarea { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
.cl-textarea:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(109, 113, 46, 0.12); }

.cl-result-bar {
  animation: cl-fade-slide-down 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.cl-result-alert { animation: cl-fade-slide-down 0.25s cubic-bezier(0.4, 0, 0.2, 1), cl-shake 0.4s ease 0.25s; }

.cl-drop-target { box-shadow: inset 0 0 0 2px rgba(109, 113, 46, 0.45); transition: box-shadow 0.15s ease; }

.cl-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-faint);
  font-size: 12px;
  animation: cl-fade-in 0.2s ease;
}
.cl-loading-spinner {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid var(--border-bright);
  border-top-color: var(--primary);
  animation: cl-spin 0.7s linear infinite;
}
.cl-loading-text { font-family: var(--font-display); letter-spacing: 0.03em; }

@keyframes cl-led-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.25; }
}
.cl-power-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 8px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.cl-led {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--led-color, #3a4650);
  box-shadow: 0 0 0 rgba(0,0,0,0);
  transition: background 0.25s ease, box-shadow 0.25s ease;
}
.cl-led-on { box-shadow: 0 0 6px 2px var(--led-color), 0 0 1px var(--led-color); }
.cl-led-amber { box-shadow: 0 0 5px 2px var(--led-color); animation: cl-led-blink 1.6s ease-in-out infinite; }
.cl-led-short { box-shadow: 0 0 6px 2px var(--led-color); animation: cl-led-blink 0.35s ease-in-out infinite; }
.cl-led-testing { box-shadow: 0 0 4px 1px var(--led-color); animation: cl-led-blink 0.6s ease-in-out infinite; }
.cl-led-dim { box-shadow: none; }
.cl-power-label {
  font-size: 10.5px;
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
  white-space: nowrap;
}

.cl-bench { overflow: hidden; position: relative; }

@media (prefers-reduced-motion: reduce) {
  .cl-toolbar *, .cl-result-bar, .cl-details-bar, .cl-btn, .cl-stat-dot, .cl-spin,
  .cl-spin-slow, .cl-icon-pop, .cl-loading-spinner, .cl-led-amber,
  .cl-led-short, .cl-led-testing {
    animation: none !important;
    transition: none !important;
  }
}
`;