import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import PowerButton from "../components/PowerButton";
import { useAuth } from "../context/AuthContext";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;
const PASSWORD_HINT =
  "8-20 characters with uppercase, lowercase, number, and special character.";

const formVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
};

function getPasswordStrength(pass) {
  let score = 0;
  if (!pass) return { score: 0, label: "", color: "transparent" };
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 1) return { score: 25, label: "Weak", color: "var(--danger)" };
  if (score <= 2) return { score: 50, label: "Fair", color: "var(--gold)" };
  if (score <= 3) return { score: 75, label: "Good", color: "var(--cyan)" };
  return { score: 100, label: "Strong", color: "var(--primary)" };
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState("");

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const strength = getPasswordStrength(form.password);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!USERNAME_RE.test(form.username)) {
      setFormError("Username must be 3-20 characters: letters, numbers, and underscores only.");
      return;
    }
    const password = form.password.trim();
    if (!PASSWORD_RE.test(password)) {
      setFormError(`Password must be ${PASSWORD_HINT}`);
      return;
    }

    setStatus("loading");
    try {
      await register(form.name, form.username, password);
      navigate("/dashboard");
    } catch (err) {
      setStatus("error");
      setFormError(err.response?.data?.error || "Couldn't create your account. Try again.");
      setTimeout(() => setStatus("idle"), 1400);
    }
  }

  return (
    <AuthLayout
      eyebrow="ONBOARDING"
      title="Create Workspace"
      subtitle="Set up your virtual hardware bench in seconds."
    >
      <motion.form
        onSubmit={handleSubmit}
        variants={formVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fieldVariants}>
          <FormField
            label="Full Name"
            required
            value={form.name}
            onChange={update("name")}
            placeholder="e.g. Nikola Tesla"
            autoComplete="name"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
        </motion.div>

        <motion.div variants={fieldVariants}>
          <FormField
            label="Username"
            required
            value={form.username}
            onChange={update("username")}
            placeholder="e.g. n_tesla"
            autoComplete="username"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
              </svg>
            }
          />
        </motion.div>

        <motion.div variants={fieldVariants}>
          <FormField
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={update("password")}
            placeholder="8-20 characters"
            autoComplete="new-password"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />

          {/* Password strength indicator */}
          {form.password && (
            <div style={{ margin: "-8px 0 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-display)" }}>
                  SECURITY LEVEL
                </span>
                <span style={{ fontSize: 11, color: strength.color, fontWeight: 700, fontFamily: "var(--font-display)" }}>
                  {strength.label}
                </span>
              </div>
              <div style={{ height: 4, width: "100%", background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.score}%`, background: strength.color }}
                  transition={{ duration: 0.25 }}
                  style={{ height: "100%", borderRadius: 2 }}
                />
              </div>
            </div>
          )}

          {!form.password && (
            <p style={{ color: "var(--text-faint)", fontSize: 11.5, margin: "-8px 0 14px", lineHeight: 1.4 }}>
              {PASSWORD_HINT}
            </p>
          )}
        </motion.div>

        {formError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: "var(--danger)", fontSize: 13, margin: "-4px 0 16px", fontWeight: 500 }}
          >
            {formError}
          </motion.p>
        )}

        <motion.div variants={fieldVariants} style={{ marginTop: 8 }}>
          <PowerButton type="submit" status={status}>
            Initialize Workbench
          </PowerButton>
        </motion.div>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        style={{ color: "var(--text-dim)", fontSize: 13.5, marginTop: 22, textAlign: "center" }}
      >
        Already have a bench?{" "}
        <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
          Sign in here →
        </Link>
      </motion.p>
    </AuthLayout>
  );
}
