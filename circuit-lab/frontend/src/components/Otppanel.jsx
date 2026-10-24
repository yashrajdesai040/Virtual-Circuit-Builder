import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PowerButton from "./PowerButton";
import { useAuth } from "../context/AuthContext";
import { CheckIcon } from "./icons/PremiumIcons";

const RESEND_COOLDOWN = 30;
const LENGTH = 6;

export default function OtpPanel({ email, onVerified, onBack }) {
  const { verifyOtp, resendOtp } = useAuth();

  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [status, setStatus] = useState("idle");
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const otp = digits.join("");

  function handleChange(i, value) {
    const char = value.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[i] = char;
      return next;
    });
    if (char && i < LENGTH - 1) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!text) return;
    const next = Array(LENGTH).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    inputRefs.current[Math.min(text.length, LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (otp.length < LENGTH) return;
    setFormError("");
    setResendMessage("");
    setStatus("loading");
    try {
      await verifyOtp(email.trim().toLowerCase(), otp);
      setSuccess(true);
      setTimeout(() => onVerified?.(), 550);
    } catch (err) {
      setStatus("error");
      setFormError(err.response?.data?.error || "Couldn't verify that code. Try again.");
      setDigits(Array(LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setTimeout(() => setStatus("idle"), 1200);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setFormError("");
    setResendMessage("");
    try {
      await resendOtp(email.trim().toLowerCase());
      setResendMessage("New code sent.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setFormError(err.response?.data?.error || "Couldn't resend a code right now.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ color: "var(--text-dim)", fontSize: 13, margin: "0 0 18px" }}>
        Code sent to <strong style={{ color: "var(--text)" }}>{email}</strong>
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }} onPaste={handlePaste}>
        {digits.map((d, i) => (
          <motion.input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            animate={d ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              width: "100%",
              height: 50,
              textAlign: "center",
              fontSize: 20,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              background: "var(--surface-2)",
              border: `1.5px solid ${success ? "var(--primary)" : d ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)",
              color: "var(--text)",
              outline: "none",
            }}
          />
        ))}
      </div>

      {formError && (
        <p style={{ color: "var(--danger)", fontSize: 13, margin: "-6px 0 14px" }}>{formError}</p>
      )}
      {resendMessage && (
        <p style={{ color: "var(--primary)", fontSize: 13, margin: "-6px 0 14px" }}>{resendMessage}</p>
      )}

      <PowerButton type="submit" status={status}>
        {success ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <CheckIcon size={13} color="currentColor" strokeWidth={3} /> Verified
          </span>
        ) : (
          "Verify & continue"
        )}
      </PowerButton>

      <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 18, textAlign: "center" }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            color: cooldown > 0 ? "var(--text-faint)" : "var(--accent)",
            cursor: cooldown > 0 ? "default" : "pointer",
          }}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
        {onBack && (
          <>
            {"  ·  "}
            <button
              type="button"
              onClick={onBack}
              style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "var(--text-faint)", cursor: "pointer" }}
            >
              Back
            </button>
          </>
        )}
      </p>
    </form>
  );
}