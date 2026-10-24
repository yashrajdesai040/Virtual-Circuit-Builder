import os
import random
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timezone, timedelta

OTP_TTL_MINUTES = 10
OTP_RESEND_COOLDOWN_SECONDS = 30

SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER)


def generate_otp():
    return f"{random.randint(0, 999999):06d}"


def otp_expiry():
    return datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)


def send_otp_email(to_email, otp_code):
    """
    Sends the OTP by real email if SMTP_HOST/SMTP_USER/SMTP_PASSWORD are set
    (e.g. a Gmail App Password). If they're not configured, prints the code
    to the backend console instead - so registration is fully testable on a
    fresh setup with zero email configuration.
    """
    if not (SMTP_HOST and SMTP_USER and SMTP_PASSWORD):
        print(f"\n{'=' * 50}\n[DEV MODE - no SMTP configured]\nOTP for {to_email}: {otp_code}\n{'=' * 50}\n")
        return

    msg = MIMEText(
        f"Your CircuitLab verification code is: {otp_code}\n\n"
        f"It expires in {OTP_TTL_MINUTES} minutes. If you didn't request this, ignore this email."
    )
    msg["Subject"] = "Your CircuitLab verification code"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM, [to_email], msg.as_string())