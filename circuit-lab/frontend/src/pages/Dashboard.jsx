import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AppShell from "../components/AppShell";
import NewCircuitModal from "../components/NewCircuitModal";
import SpotlightCard from "../components/SpotlightCard";
import KineticHeadline from "../components/KineticHeadline";
import BorderBeam from "../components/BorderBeam";
import ThinkingOrb from "../components/ThinkingOrb";
import LiquidMetalButton from "../components/LiquidMetalButton";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../utils/timeAgo";
import client from "../api/client";
import soundFX from "../utils/soundEffects";
import {
  PencilIcon,
  TrashIcon,
  PackageIcon,
  BoltIcon,
  ChipIcon,
  PlayIcon,
  CloseIcon,
  PlugIcon,
} from "../components/icons/PremiumIcons";

const RUN_STATUS = {
  complete: { label: "Working", color: "var(--primary)" },
  open: { label: "Open circuit", color: "var(--gold)" },
  short: { label: "Short circuit", color: "var(--danger)" },
  no_source: { label: "No power source", color: "var(--text-faint)" },
};

const MotionLink = motion(Link);

const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};
const menuVariants = {
  hidden: { opacity: 0, scale: 0.92, y: -6 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.94, y: -4, transition: { duration: 0.1 } },
};
const modalBackdropVariants = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } };
const modalPanelVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function runBadge(project) {
  if (!project.last_run_status) return { label: "Untested", color: "var(--text-faint)" };
  return RUN_STATUS[project.last_run_status] || { label: "Unknown", color: "var(--text-faint)" };
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const duration = 600;
    const start = performance.now();
    let raf;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display}</>;
}

function Toast({ toast }) {
  return (
    <div style={styles.toastWrap}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              ...styles.toast,
              borderColor: toast.type === "error" ? "var(--danger)" : "var(--primary)",
            }}
          >
            <span
              style={{
                ...styles.toastDot,
                background: toast.type === "error" ? "var(--danger)" : "var(--primary)",
              }}
            />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectMenu({ project, onRename, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  function stop(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div ref={ref} style={{ position: "relative" }} onClick={stop}>
      <motion.button
        whileHover={{ background: "var(--border)", scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          stop(e);
          setOpen((o) => !o);
        }}
        style={styles.kebabBtn}
        aria-label="Circuit options"
      >
        ⋮
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={styles.menu}
            onClick={stop}
          >
            <button
              style={styles.menuItem}
              onClick={(e) => {
                stop(e);
                setOpen(false);
                onRename(project);
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <PencilIcon size={12} color="currentColor" /> Rename
              </span>
            </button>
            <button
              style={styles.menuItem}
              onClick={(e) => {
                stop(e);
                setOpen(false);
                onDuplicate(project);
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <PackageIcon size={12} color="currentColor" /> Duplicate
              </span>
            </button>
            <div style={styles.menuDivider} />
            <button
              style={{ ...styles.menuItem, color: "var(--danger)" }}
              onClick={(e) => {
                stop(e);
                setOpen(false);
                onDelete(project);
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <TrashIcon size={12} color="currentColor" /> Delete
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DeleteConfirmModal({ project, onCancel, onConfirm, deleting }) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          style={styles.backdrop}
          onClick={onCancel}
        >
          <motion.div
            variants={modalPanelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={styles.confirmPanel}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={styles.dangerIcon}>!</div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Delete this circuit?</h3>
            </div>
            <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--text)" }}>{project.name}</strong> and all placed parts,
              wiring, and simulation configurations will be permanently erased.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button style={styles.cancelBtn} onClick={onCancel} disabled={deleting}>
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: deleting ? 1 : 1.02 }}
                whileTap={{ scale: deleting ? 1 : 0.98 }}
                style={styles.deleteBtn}
                onClick={onConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete circuit"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  function loadProjects() {
    setLoading(true);
    const defaultProjects = [
      {
        id: 101,
        name: "ESP32 Blink & LED Array",
        description: "Interactive ESP32 micro-controller board wired to multi-color LEDs with PWM control.",
        last_run_status: "complete",
        updated_at: new Date().toISOString(),
        is_public: true,
        circuit_json: {
          nodes: [
            { id: "n1", type: "esp32", position: { x: -2, y: 0, z: 0 } },
            { id: "n2", type: "breadboard", position: { x: 2, y: 0, z: 0 } },
            { id: "n3", type: "led", position: { x: 2, y: 0.5, z: -1 } },
            { id: "n4", type: "resistor", position: { x: 2, y: 0.5, z: 1 } },
          ],
          edges: [
            { id: "e1", sourceId: "n1", sourceTerminal: "GPIO2", targetId: "n3", targetTerminal: "anode" },
            { id: "e2", sourceId: "n3", sourceTerminal: "cathode", targetId: "n4", targetTerminal: "pin1" },
            { id: "e3", sourceId: "n4", sourceTerminal: "pin2", targetId: "n1", targetTerminal: "GND" },
          ],
        },
      },
      {
        id: 102,
        name: "Basic 9V DC Circuit",
        description: "DC voltage source with current-limiting resistor and indicator LED.",
        last_run_status: "complete",
        updated_at: new Date().toISOString(),
        is_public: false,
        circuit_json: {
          nodes: [
            { id: "n1", type: "battery_9v", position: { x: -2, y: 0, z: 0 } },
            { id: "n2", type: "resistor", position: { x: 0, y: 0, z: 0 } },
            { id: "n3", type: "led", position: { x: 2, y: 0, z: 0 } },
          ],
          edges: [
            { id: "e1", sourceId: "n1", sourceTerminal: "pos", targetId: "n2", targetTerminal: "pin1" },
            { id: "e2", sourceId: "n2", sourceTerminal: "pin2", targetId: "n3", targetTerminal: "anode" },
            { id: "e3", sourceId: "n3", sourceTerminal: "cathode", targetId: "n1", targetTerminal: "neg" },
          ],
        },
      },
    ];

    client
      .get("/projects")
      .then((res) => {
        if (Array.isArray(res.data?.projects)) {
          setProjects(res.data.projects);
          return;
        }
        throw new Error("No projects array");
      })
      .catch(() => {
        const saved = localStorage.getItem("cl_projects");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length) {
              setProjects(parsed);
              return;
            }
          } catch (e) {}
        }
        setProjects(defaultProjects);
        localStorage.setItem("cl_projects", JSON.stringify(defaultProjects));
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProjects();
    window.addEventListener("project-invite-accepted", loadProjects);
    return () => window.removeEventListener("project-invite-accepted", loadProjects);
  }, []);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  function showToast(message, type = "success") {
    setToast({ id: Date.now(), message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  }

  async function handleCreate({ name, description }) {
    setCreating(true);
    setCreateError("");
    try {
      const res = await client.post("/projects", {
        name,
        description,
        circuit_json: { nodes: [], edges: [] },
      });
      navigate(`/builder/${res.data.project.id}`);
    } catch (err) {
      const newProj = {
        id: Date.now(),
        name,
        description,
        circuit_json: { nodes: [], edges: [] },
        last_run_status: "untested",
        updated_at: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem("cl_projects") || "[]");
      const updated = [newProj, ...existing];
      localStorage.setItem("cl_projects", JSON.stringify(updated));
      setProjects(updated);
      navigate(`/builder/${newProj.id}`);
    } finally {
      setCreating(false);
    }
  }

  function startRename(project) {
    setRenamingId(project.id);
    setRenameValue(project.name);
  }

  async function commitRename(project) {
    const nextName = renameValue.trim();
    setRenamingId(null);
    if (!nextName || nextName === project.name) return;

    const prevProjects = projects;
    setProjects((ps) => ps.map((p) => (p.id === project.id ? { ...p, name: nextName } : p)));

    try {
      await client.patch(`/projects/${project.id}`, { name: nextName });
      showToast("Circuit renamed");
    } catch (err) {
      setProjects(prevProjects);
      showToast(err.response?.data?.error || "Couldn't rename the circuit", "error");
    }
  }

  async function handleDuplicate(project) {
    try {
      const res = await client.post("/projects", {
        name: `${project.name} (copy)`,
        description: project.description,
        circuit_json: project.circuit_json || { nodes: [], edges: [] },
      });
      setProjects((ps) => [res.data.project, ...ps]);
      showToast("Circuit duplicated");
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't duplicate the circuit", "error");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await client.delete(`/projects/${deleteTarget.id}`);
      setProjects((ps) => ps.filter((p) => p.id !== deleteTarget.id));
      showToast("Circuit deleted");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.error || "Couldn't delete the circuit", "error");
    } finally {
      setDeleting(false);
    }
  }

  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);

  const stats = useMemo(() => {
    const totalComponents = safeProjects.reduce((sum, p) => sum + (p.circuit_json?.nodes?.length || 0), 0);
    const totalRuns = safeProjects.reduce((sum, p) => sum + (p.run_count || 0), 0);
    return { active: safeProjects.length, totalComponents, totalRuns };
  }, [safeProjects]);

  const recentActivity = useMemo(() => {
    return safeProjects
      .filter((p) => p.last_run_at)
      .sort((a, b) => new Date(b.last_run_at) - new Date(a.last_run_at))
      .slice(0, 6);
  }, [safeProjects]);

  const visibleProjects = useMemo(() => {
    let list = safeProjects;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) => (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
      );
    }
    list = [...list];
    if (sortBy === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "components") {
      list.sort((a, b) => (b.circuit_json?.nodes?.length || 0) - (a.circuit_json?.nodes?.length || 0));
    } else {
      list.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
    }
    return list;
  }, [safeProjects, query, sortBy]);

  return (
    <AppShell>
      <div style={{ padding: "36px 6vw" }}>
        {/* Aceternity Bento Header Banner with Jakub Antalik Border Beam */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={styles.banner}
        >
          <BorderBeam size={340} duration={8} colorFrom="#FFFFFF" colorTo="#94A3B8" />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div className="tech-badge" style={{ marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)" }} className="neon-active" />
              LAB WORKSPACE
            </div>
            <KineticHeadline
              lines={[`${greeting()},`, `${user?.name || "Builder"}`]}
              style={styles.bannerTitle}
            />
            <p style={styles.bannerSub}>
              Design, test, and debug electronic circuits with real-time 3D physics and nodal analysis.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 2 }}>
            <LiquidMetalButton
              variant="platinum"
              size="lg"
              onClick={() => {
                soundFX.playBlip(820);
                setModalOpen(true);
              }}
              icon={<BoltIcon size={16} color="#0A0A0D" fill="#0A0A0D" />}
            >
              New circuit
            </LiquidMetalButton>
            <Link
              to="/components"
              className="btn-ghost-vibe"
              style={{ textDecoration: "none" }}
              onClick={() => soundFX.playBlip(650)}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <PackageIcon size={14} color="currentColor" /> Browse parts 3D
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Aceternity / MagicUI Spotlight Bento Stat Cards */}
        <motion.div
          style={styles.statGrid}
          variants={gridVariants}
          initial="hidden"
          animate="show"
        >
          <SpotlightCard
            spotlightColor="rgba(255, 255, 255, 0.16)"
            borderColor="rgba(255, 255, 255, 0.18)"
            style={{ padding: "20px 22px" }}
          >
            <div style={styles.statCardInner}>
              <div style={styles.statTop}>
                <span className="eyebrow" style={{ color: "var(--text-dim)" }}>Active Projects</span>
                <div style={{ ...styles.statIconBadge, color: "var(--text)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <BoltIcon size={14} color="var(--text)" fill="var(--text)" />
                </div>
              </div>
              <div style={styles.statValue}>
                <AnimatedNumber value={stats.active} />
              </div>
              <div style={styles.statSub}>Circuits in your workspace</div>
            </div>
          </SpotlightCard>

          <SpotlightCard
            spotlightColor="rgba(229, 228, 226, 0.14)"
            borderColor="var(--border)"
            style={{ padding: "20px 22px" }}
          >
            <div style={styles.statCardInner}>
              <div style={styles.statTop}>
                <span className="eyebrow" style={{ color: "var(--text-dim)" }}>Components Placed</span>
                <div style={{ ...styles.statIconBadge, color: "var(--text)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <ChipIcon size={14} color="var(--text)" />
                </div>
              </div>
              <div style={styles.statValue}>
                <AnimatedNumber value={stats.totalComponents} />
              </div>
              <div style={styles.statSub}>Across all schematic boards</div>
            </div>
          </SpotlightCard>

          <SpotlightCard
            spotlightColor="rgba(148, 163, 184, 0.14)"
            borderColor="var(--border)"
            style={{ padding: "20px 22px" }}
          >
            <div style={styles.statCardInner}>
              <div style={styles.statTop}>
                <span className="eyebrow" style={{ color: "var(--text-dim)" }}>Simulations Run</span>
                <div style={{ ...styles.statIconBadge, color: "var(--text)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <PlayIcon size={13} color="var(--text)" fill="var(--text)" />
                </div>
              </div>
              <div style={styles.statValue}>
                <AnimatedNumber value={stats.totalRuns} />
              </div>
              <div style={styles.statSub}>MNA nodal matrix solves</div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Main Content Area */}
        <div style={styles.layout}>
          {/* Project List */}
          <div>
            <div style={styles.listHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 17, margin: 0, fontWeight: 700, color: "var(--text)" }}>
                  Recent circuits
                </h2>
                <span style={styles.countPill}>{visibleProjects.length}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search circuits…"
                    style={styles.searchInput}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      style={styles.clearSearchBtn}
                      title="Clear search"
                      aria-label="Clear search"
                    >
                      <CloseIcon size={12} color="var(--text-dim)" />
                    </button>
                  )}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={styles.sortSelect}
                >
                  <option value="recent">Recently updated</option>
                  <option value="name">Name (A–Z)</option>
                  <option value="components">Most components</option>
                </select>
              </div>
            </div>

            {loading && (
              <div style={styles.loadingWrap}>
                <span className="neon-active" style={styles.loadingDot} />
                <span style={{ color: "var(--text-dim)", fontSize: 13.5 }}>Loading workspace circuits…</span>
              </div>
            )}

            {!loading && projects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={styles.empty}
              >
                <div style={styles.emptyIcon}>
                  <PlugIcon size={32} color="var(--text-dim)" />
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>No circuits built yet</h3>
                <p style={{ margin: "0 0 18px", color: "var(--text-dim)", fontSize: 13, maxWidth: 360 }}>
                  Start by laying out your first breadboard circuit or explore components from the 3D catalog.
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalOpen(true)}
                  style={styles.newBtn}
                >
                  + Create your first circuit
                </motion.button>
              </motion.div>
            )}

            {!loading && projects.length > 0 && visibleProjects.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.empty}>
                No circuits match <strong style={{ color: "var(--text)" }}>"{query}"</strong>.
              </motion.div>
            )}

            {!loading && visibleProjects.length > 0 && (
              <motion.div style={styles.list} variants={gridVariants} initial="hidden" animate="show" layout>
                <AnimatePresence initial={false}>
                  {visibleProjects.map((p) => {
                    const badge = runBadge(p);
                    const isRenaming = renamingId === p.id;
                    const nodeCount = (p.circuit_json?.nodes || []).length;

                    return (
                      <motion.div
                        key={p.id}
                        variants={cardVariants}
                        layout
                        style={{ textDecoration: "none" }}
                      >
                        <SpotlightCard
                          spotlightColor="rgba(255, 255, 255, 0.12)"
                          borderColor="rgba(229, 228, 226, 0.16)"
                          style={{ padding: "16px 20px" }}
                          onClick={() => {
                            if (!isRenaming) navigate(`/builder/${p.id}`);
                          }}
                        >
                          <div style={styles.projectCardContent}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {isRenaming ? (
                                  <input
                                    ref={renameInputRef}
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        commitRename(p);
                                      }
                                      if (e.key === "Escape") {
                                        e.preventDefault();
                                        setRenamingId(null);
                                      }
                                    }}
                                    onBlur={() => commitRename(p)}
                                    style={styles.renameInput}
                                  />
                                ) : (
                                  <span style={styles.rowName}>{p.name}</span>
                                )}
                                {!p.is_owner && <span style={styles.sharedTag}>Shared</span>}
                              </div>

                              {p.description && !isRenaming && (
                                <div style={styles.rowDesc}>{p.description}</div>
                              )}

                              <div style={styles.rowMeta}>
                                <span style={styles.metaChip}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    <ChipIcon size={11} color="currentColor" />
                                    <span>{nodeCount} {nodeCount === 1 ? "part" : "parts"}</span>
                                  </span>
                                </span>
                                <span style={{ color: "var(--border-bright)" }}>•</span>
                                <span>Updated {timeAgo(p.updated_at)}</span>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                              <div style={{ ...styles.statusPill, borderColor: badge.color }}>
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: badge.color,
                                    boxShadow: `0 0 6px ${badge.color}`,
                                  }}
                                />
                                <span style={{ color: badge.color }}>{badge.label}</span>
                              </div>

                              {p.is_owner !== false && (
                                <ProjectMenu
                                  project={p}
                                  onRename={startRename}
                                  onDuplicate={handleDuplicate}
                                  onDelete={setDeleteTarget}
                                />
                              )}
                            </div>
                          </div>
                        </SpotlightCard>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Telemetry Activity Feed */}
          <div style={styles.activityPanel}>
            <div style={styles.activityHeader}>
              <h2 style={{ fontSize: 14, margin: 0, fontWeight: 700, color: "var(--text)" }}>
                Live Telemetry
              </h2>
              <span className="tech-badge" style={{ fontSize: 9.5, padding: "2px 7px" }}>
                REALTIME
              </span>
            </div>

            {recentActivity.length === 0 && (
              <p style={{ color: "var(--text-faint)", fontSize: 12.5, margin: "10px 0" }}>
                No simulations logged yet. Hit <strong>Run circuit</strong> in the builder to stream telemetry here.
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentActivity.map((p, i) => {
                const badge = runBadge(p);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    style={styles.activityRow}
                  >
                    <span style={{ ...styles.activityDot, background: badge.color, boxShadow: `0 0 6px ${badge.color}` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.activityTime}>{timeAgo(p.last_run_at)}</div>
                      <div style={styles.activityName}>{p.name}</div>
                      <div style={{ color: badge.color, fontSize: 11.5, fontWeight: 600 }}>{badge.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <NewCircuitModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCreateError("");
        }}
        onCreate={handleCreate}
        creating={creating}
        error={createError}
      />

      <DeleteConfirmModal
        project={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        deleting={deleting}
      />

      <Toast toast={toast} />
    </AppShell>
  );
}

const styles = {
  banner: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 32,
    background: "linear-gradient(135deg, rgba(28, 30, 38, 0.7) 0%, rgba(18, 20, 26, 0.78) 100%)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "var(--radius)",
    padding: "28px 32px",
    overflow: "hidden",
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
  },
  bannerTitle: {
    fontSize: "clamp(24px, 3vw, 32px)",
    margin: 0,
    fontFamily: "var(--font-body)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  bannerSub: {
    color: "var(--text-dim)",
    fontSize: 14,
    margin: "8px 0 0",
    maxWidth: 580,
    lineHeight: 1.5,
  },
  newBtn: {
    position: "relative",
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "var(--cta-bg)",
    color: "var(--cta-text)",
    fontWeight: 800,
    fontSize: 13.5,
    padding: "10px 20px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--cta-border)",
    boxShadow: "var(--cta-shadow)",
    cursor: "pointer",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "var(--surface)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    color: "var(--text)",
    fontWeight: 600,
    fontSize: 13.5,
    padding: "10px 18px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    textDecoration: "none",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    transition: "all 0.2s ease",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
    marginBottom: 36,
  },
  statCardInner: {
    display: "flex",
    flexDirection: "column",
  },
  statTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    display: "grid",
    placeItems: "center",
    fontSize: 13,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 800,
    margin: "12px 0 4px",
    fontFamily: "var(--font-display)",
    color: "var(--text)",
  },
  statSub: {
    color: "var(--text-faint)",
    fontSize: 12,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 310px",
    gap: 30,
    alignItems: "start",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  countPill: {
    fontFamily: "var(--font-display)",
    fontSize: 11,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
    color: "var(--text-dim)",
  },
  searchInput: {
    background: "var(--surface)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    fontSize: 13,
    padding: "8px 12px",
    outline: "none",
    width: 190,
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
  },
  clearSearchBtn: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    cursor: "pointer",
    fontSize: 11,
  },
  sortSelect: {
    background: "var(--surface)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    fontSize: 12.5,
    padding: "8px 10px",
    outline: "none",
    cursor: "pointer",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
  },
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "24px 0",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--primary)",
  },
  empty: {
    border: "1.5px dashed var(--border-bright)",
    borderRadius: "var(--radius)",
    padding: "48px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    background: "rgba(14, 20, 27, 0.4)",
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  projectCardContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  rowName: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--text)",
    letterSpacing: "-0.01em",
  },
  rowDesc: {
    fontSize: 12.5,
    color: "var(--text-dim)",
    marginTop: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 520,
    lineHeight: 1.4,
  },
  rowMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 11.5,
    color: "var(--text-faint)",
    marginTop: 8,
    fontFamily: "var(--font-display)",
  },
  metaChip: {
    color: "var(--text-dim)",
  },
  sharedTag: {
    fontSize: 10,
    fontFamily: "var(--font-display)",
    color: "var(--accent)",
    background: "rgba(255, 111, 94, 0.12)",
    border: "1px solid rgba(255, 111, 94, 0.3)",
    borderRadius: "var(--radius-full)",
    padding: "1px 7px",
    textTransform: "uppercase",
    fontWeight: 600,
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11.5,
    fontFamily: "var(--font-display)",
    border: "1px solid",
    borderRadius: "var(--radius-full)",
    padding: "4px 10px",
    whiteSpace: "nowrap",
    background: "rgba(0, 0, 0, 0.2)",
    fontWeight: 600,
  },
  renameInput: {
    fontSize: 14.5,
    fontWeight: 700,
    color: "var(--text)",
    background: "var(--bg)",
    border: "1px solid var(--primary)",
    borderRadius: 6,
    padding: "4px 8px",
    outline: "none",
    minWidth: 180,
  },
  kebabBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--text-dim)",
    width: 28,
    height: 28,
    fontSize: 16,
    lineHeight: 1,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },
  menu: {
    position: "absolute",
    top: 34,
    right: 0,
    background: "rgba(16, 22, 29, 0.95)",
    backdropFilter: "blur(16px)",
    border: "1px solid var(--border-bright)",
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
    minWidth: 140,
    padding: 6,
    zIndex: 25,
  },
  menuItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    color: "var(--text)",
    fontSize: 12.5,
    padding: "8px 10px",
    borderRadius: 6,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  menuDivider: {
    height: 1,
    background: "var(--border)",
    margin: "4px 2px",
  },
  activityPanel: {
    background: "rgba(14, 20, 27, 0.8)",
    backdropFilter: "blur(14px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "20px",
    position: "sticky",
    top: 86,
  },
  activityHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  activityRow: {
    display: "flex",
    gap: 12,
    padding: "10px 0",
    borderTop: "1px solid rgba(47, 62, 80, 0.35)",
  },
  activityDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    marginTop: 6,
    flexShrink: 0,
  },
  activityTime: {
    fontSize: 10.5,
    color: "var(--text-faint)",
    fontFamily: "var(--font-display)",
  },
  activityName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text)",
    margin: "2px 0",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 16,
  },
  confirmPanel: {
    background: "rgba(16, 22, 29, 0.95)",
    backdropFilter: "blur(16px)",
    border: "1px solid var(--border-bright)",
    borderRadius: "var(--radius)",
    padding: "24px 26px",
    width: "100%",
    maxWidth: 380,
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  },
  dangerIcon: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "rgba(255, 71, 87, 0.15)",
    color: "var(--danger)",
    display: "grid",
    placeItems: "center",
    fontSize: 13,
    fontWeight: 800,
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid var(--border-bright)",
    color: "var(--text-dim)",
    fontSize: 13,
    fontWeight: 600,
    padding: "9px 16px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "var(--danger)",
    border: "none",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    padding: "9px 16px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
  },
  toastWrap: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 200,
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(16, 22, 29, 0.95)",
    backdropFilter: "blur(16px)",
    border: "1px solid",
    borderRadius: "var(--radius-sm)",
    padding: "10px 16px",
    fontSize: 13,
    color: "var(--text)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
  },
  toastDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    flexShrink: 0,
  },
};
