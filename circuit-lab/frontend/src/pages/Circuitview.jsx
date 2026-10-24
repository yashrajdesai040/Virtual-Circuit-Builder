import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import Scene3D from "../components/builder3d/Scene3D";
import { PlayIcon, HeartIcon } from "../components/AnimatedIcon";
import client from "../api/client";
import { CheckIcon, CloseIcon, WarningIcon, InfoIcon, BoltIcon, EyeIcon } from "../components/icons/PremiumIcons";

const noop = () => {};

const RESULT_ICON = {
  complete: <CheckIcon size={14} color="var(--color-green)" strokeWidth={3} />,
  open: <WarningIcon size={14} color="var(--gold)" />,
  short: <BoltIcon size={14} color="var(--danger)" fill="var(--danger)" />,
  no_source: <InfoIcon size={14} color="var(--text-dim)" />,
  error: <CloseIcon size={14} color="var(--danger)" strokeWidth={3} />,
};
const RESULT_STYLE = {
  complete: { background: "rgba(109, 113, 46, 0.18)", color: "var(--color-green)", borderColor: "var(--color-green)" },
  open: { background: "rgba(255,201,77,0.12)", color: "var(--gold)", borderColor: "var(--gold)" },
  short: { background: "rgba(255,71,87,0.12)", color: "var(--danger)", borderColor: "var(--danger)" },
  no_source: { background: "var(--surface-2)", color: "var(--text-dim)", borderColor: "var(--border-bright)" },
  error: { background: "rgba(255,71,87,0.12)", color: "var(--danger)", borderColor: "var(--danger)" },
};

export default function CircuitView() {
  const { id } = useParams();
  const cameraRef = useRef(null);

  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  const [simResult, setSimResult] = useState(null);
  const [simRunning, setSimRunning] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      client.get(`/projects/${id}`),
      client.get(`/community/projects/${id}`),
      client.get(`/community/projects/${id}/comments`),
    ])
      .then(([projRes, statsRes, commentsRes]) => {
        setProject(projRes.data.project);
        setStats(statsRes.data.project);
        setComments(commentsRes.data.comments);
      })
      .catch(() => setError("This circuit isn't public, or doesn't exist."))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleLike() {
    const res = await client.post(`/community/projects/${id}/like`);
    setStats((s) => ({ ...s, liked_by_me: res.data.liked, like_count: res.data.like_count }));
  }

  async function submitComment(e) {
    e.preventDefault();
    const body = commentText.trim();
    if (!body) return;
    setPosting(true);
    try {
      const res = await client.post(`/community/projects/${id}/comments`, { body });
      setComments((c) => [...c, res.data.comment]);
      setCommentText("");
      setStats((s) => ({ ...s, comment_count: (s?.comment_count || 0) + 1 }));
    } finally {
      setPosting(false);
    }
  }

  // Read-only test run - hits the stateless /simulate/live endpoint (no
  // save, no ownership required, doesn't touch the owner's run_count).
  async function handleRun() {
    setSimRunning(true);
    setSimResult(null);
    try {
      const res = await client.post(`/projects/${id}/simulate/live`, {
        nodes: project.circuit_json?.nodes || [],
        edges: project.circuit_json?.edges || [],
      });
      setSimResult(res.data);
    } catch (err) {
      setSimResult({
        status: "error",
        message: err.response?.data?.error || "Couldn't run the simulation.",
        poweredIds: [],
      });
    } finally {
      setSimRunning(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: "60px", color: "var(--text-dim)" }}>Loading circuit…</div>
      </AppShell>
    );
  }

  if (error || !project) {
    return (
      <AppShell>
        <div style={{ padding: "60px", textAlign: "center" }}>
          <p style={{ color: "var(--text-dim)", marginBottom: 16 }}>{error}</p>
          <Link to="/share" style={{ color: "var(--primary)" }}>
            ← Back to shared circuits
          </Link>
        </div>
      </AppShell>
    );
  }

  const nodes = project.circuit_json?.nodes || [];
  const edges = project.circuit_json?.edges || [];

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 65px)" }}>
        <div style={styles.toolbar}>
          <div>
            <Link to="/share" style={styles.backLink}>
              ← Shared circuits
            </Link>
            <h1 style={styles.title}>{project.name}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={handleRun}
              disabled={simRunning}
              className="btn-tactile-gold btn-shimmer"
              style={{ padding: "7px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 7 }}
              title="Test-run this circuit - doesn't save or change anything"
            >
              {simRunning ? (
                <span className="cl-spin">◐</span>
              ) : (
                <PlayIcon size={13} color="var(--color-ink)" />
              )}
              <span>{simRunning ? "Running…" : "Run circuit"}</span>
            </button>
            <button
              onClick={toggleLike}
              className="btn-ghost-vibe"
              style={{
                padding: "7px 14px",
                fontSize: 13,
                color: stats?.liked_by_me ? "var(--danger)" : "var(--color-paper)",
                borderColor: stats?.liked_by_me ? "var(--danger)" : "var(--color-line)",
                gap: 6,
              }}
            >
              <HeartIcon size={15} color={stats?.liked_by_me ? "var(--danger)" : "currentColor"} filled={!!stats?.liked_by_me} />
              <span style={{ fontFamily: "var(--font-data)" }}>{stats?.like_count ?? 0}</span>
            </button>
          </div>
        </div>

        {simResult && (
          <div style={{ ...styles.resultBar, ...RESULT_STYLE[simResult.status] }}>
            <span>{RESULT_ICON[simResult.status] || <InfoIcon size={14} color="currentColor" />}</span>
            <span>{simResult.message}</span>
          </div>
        )}

        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Scene3D
              nodes={nodes}
              edges={edges}
              draggingId={null}
              onDragStart={noop}
              onDragMove={noop}
              onDragEnd={noop}
              onTerminalClick={noop}
              onToggle={noop}
              onRemove={noop}
              selectedTerminal={null}
              cameraRef={cameraRef}
              poweredIds={simResult ? new Set(simResult.poweredIds) : null}
              readings={simResult?.readings || null}
            />
            <div style={styles.viewBadge}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <EyeIcon size={13} color="currentColor" /> Read-only — you can test-run this circuit, but not edit or save it
              </span>
            </div>
          </div>

          <div style={styles.sidebar}>
            {project.description && <p style={styles.description}>{project.description}</p>}

            <div className="eyebrow" style={{ margin: "16px 0 10px" }}>
              Comments ({comments.length})
            </div>

            <div style={styles.commentList}>
              {comments.length === 0 && (
                <p style={{ color: "var(--text-faint)", fontSize: 12.5 }}>No comments yet — be the first.</p>
              )}
              {comments.map((c) => (
                <div key={c.id} style={styles.comment}>
                  <span style={styles.commentAuthor}>{c.author_name}</span>
                  <p style={styles.commentBody}>{c.body}</p>
                </div>
              ))}
            </div>

            <form onSubmit={submitComment} style={{ marginTop: 12 }}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                rows={2}
                style={styles.commentInput}
              />
              <button
                type="submit"
                disabled={posting || !commentText.trim()}
                className="btn-tactile-gold btn-shimmer"
                style={{ padding: "8px 18px", fontSize: 13, alignSelf: "flex-start" }}
              >
                {posting ? "Posting…" : "Post comment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const styles = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
  },
  backLink: { color: "var(--text-faint)", fontSize: 11.5, textDecoration: "none" },
  title: { margin: "4px 0 0", fontSize: 18, fontWeight: 600 },
  runBtn: {
    background: "transparent",
    color: "var(--accent)",
    border: "1.5px solid var(--accent)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  likeBtn: {
    background: "transparent",
    border: "1px solid var(--border-bright)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 16px",
    fontSize: 13,
    fontFamily: "var(--font-display)",
    cursor: "pointer",
  },
  resultBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 20px",
    borderBottom: "1px solid",
    fontSize: 12.5,
    fontWeight: 500,
  },
  viewBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    background: "rgba(16,22,29,0.85)",
    border: "1px solid var(--border-bright)",
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 11,
    color: "var(--text-dim)",
    backdropFilter: "blur(4px)",
  },
  sidebar: {
    width: 300,
    flexShrink: 0,
    borderLeft: "1px solid var(--border)",
    padding: "20px 18px",
    overflowY: "auto",
  },
  description: { fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 },
  commentList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: 320,
    overflowY: "auto",
  },
  comment: {
    background: "var(--surface-2)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 10px",
  },
  commentAuthor: { fontSize: 11, fontWeight: 600, color: "var(--primary)" },
  commentBody: { fontSize: 12.5, color: "var(--text)", margin: "3px 0 0", lineHeight: 1.5 },
  commentInput: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 10px",
    color: "var(--text)",
    fontSize: 12.5,
    outline: "none",
    resize: "vertical",
  },
  postBtn: {
    marginTop: 8,
    background: "var(--cta-bg)",
    color: "var(--cta-text)",
    border: "1px solid var(--cta-border)",
    boxShadow: "var(--cta-shadow)",
    borderRadius: "var(--radius-sm)",
    padding: "7px 16px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
};