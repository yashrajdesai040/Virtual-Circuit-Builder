import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import OtpPanel from "../components/OtpPanel";

// Standalone fallback route (e.g. a bookmarked/deep link). The normal flow
// now shows this inline on the Login/Register pages instead of navigating
// here, but this page still works on its own if someone lands on it directly
// - as long as an email was handed off via navigation state, since OtpPanel
// no longer has its own editable email field.
export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) navigate("/login", { replace: true });
  }, [email, navigate]);

  if (!email) return null;

  return (
    <AuthLayout eyebrow="Verify your email" title="Enter your code">
      <OtpPanel email={email} onVerified={() => navigate("/dashboard")} />
    </AuthLayout>
  );
}