import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

// ---------------------------------------------------------------------------
// Core send helper — gracefully fails so email errors never break core flows
// ---------------------------------------------------------------------------

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const transport = createTransport();
    if (!transport) {
      console.warn("[email] SMTP not configured — skipping email to", to);
      return false;
    }
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@buznify.com";
    await transport.sendMail({ from, to, subject, html });
    console.info("[email] Sent:", subject, "→", to);
    return true;
  } catch (err) {
    console.error("[email] Failed to send email to", to, err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Shared layout wrapper
// ---------------------------------------------------------------------------

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0f; font-family: 'Segoe UI', Arial, sans-serif; color: #e2e8f0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #12121a; border: 1px solid #2d2d3d; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6d28d9, #4f46e5); padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px; }
    .body { padding: 36px 40px; }
    .body h2 { margin: 0 0 16px; font-size: 20px; color: #f1f5f9; }
    .body p { margin: 0 0 16px; line-height: 1.6; color: #94a3b8; font-size: 15px; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6d28d9, #4f46e5); color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0 16px; }
    .info-box { background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 8px; padding: 20px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2d2d3d; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; }
    .info-value { color: #e2e8f0; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-success { background: rgba(16,185,129,0.15); color: #10b981; }
    .badge-pending { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #2d2d3d; }
    .footer p { margin: 0; font-size: 12px; color: #475569; }
    .footer a { color: #6d28d9; text-decoration: none; }
    .otp-box { background: #1e1e2e; border: 2px solid #6d28d9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #a78bfa; font-family: monospace; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>⚡ Buznify</h1>
        <p>Digital Marketplace</p>
      </div>
      <div class="body">${body}</div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Buznify. All rights reserved.</p>
        <p style="margin-top:8px;">You received this email because you have an account on <a href="#">Buznify</a>.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------

export function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const body = `
    <h2>Welcome to Buznify, ${name}! 🎉</h2>
    <p>Your account has been created successfully. You now have access to thousands of digital products, social media growth services, and virtual numbers — all delivered instantly.</p>
    <p>Here's what you can do:</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">🛒 Marketplace</span><span class="info-value">Browse 10,000+ digital products</span></div>
      <div class="info-row"><span class="info-label">📈 Growth Services</span><span class="info-value">Boost your social media presence</span></div>
      <div class="info-row"><span class="info-label">📱 Virtual Numbers</span><span class="info-value">Get SMS verification numbers</span></div>
      <div class="info-row"><span class="info-label">💰 Wallet</span><span class="info-value">Fast, secure payments</span></div>
    </div>
    <p>Start exploring now and enjoy instant delivery on all digital products.</p>
  `;
  return sendEmail(to, "Welcome to Buznify! 🚀", layout("Welcome to Buznify", body));
}

// ---------------------------------------------------------------------------
// Order confirmation email
// ---------------------------------------------------------------------------

export function sendOrderConfirmationEmail(
  to: string,
  opts: {
    orderId: string;
    productTitle: string;
    quantity: number;
    totalPrice: number;
    deliveryType: string;
  }
): Promise<boolean> {
  const body = `
    <h2>Order Confirmed! ✅</h2>
    <p>Your order has been placed successfully. Here are the details:</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Order ID</span><span class="info-value">#${opts.orderId.slice(0, 8).toUpperCase()}</span></div>
      <div class="info-row"><span class="info-label">Product</span><span class="info-value">${opts.productTitle}</span></div>
      <div class="info-row"><span class="info-label">Quantity</span><span class="info-value">${opts.quantity}</span></div>
      <div class="info-row"><span class="info-label">Total</span><span class="info-value">$${(opts.totalPrice / 100).toFixed(2)}</span></div>
      <div class="info-row"><span class="info-label">Delivery</span><span class="info-value"><span class="badge badge-pending">${opts.deliveryType === "instant" ? "Instant" : "Manual"}</span></span></div>
    </div>
    <p>We'll notify you as soon as your order is delivered. For instant delivery products, your credentials will appear in your order history right away.</p>
  `;
  return sendEmail(
    to,
    `Order Confirmed — #${opts.orderId.slice(0, 8).toUpperCase()}`,
    layout("Order Confirmation", body)
  );
}

// ---------------------------------------------------------------------------
// Order delivered email
// ---------------------------------------------------------------------------

export function sendOrderDeliveredEmail(
  to: string,
  opts: {
    orderId: string;
    productTitle: string;
    deliveryData?: string;
  }
): Promise<boolean> {
  const deliverySection = opts.deliveryData
    ? `<div class="info-box" style="margin-top:16px;">
        <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Delivery Data</p>
        <pre style="margin:0;font-family:monospace;font-size:14px;color:#a78bfa;white-space:pre-wrap;word-break:break-all;">${opts.deliveryData}</pre>
      </div>`
    : "";

  const body = `
    <h2>Your Order Has Been Delivered! 📦</h2>
    <p>Great news! Your order is ready.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Order ID</span><span class="info-value">#${opts.orderId.slice(0, 8).toUpperCase()}</span></div>
      <div class="info-row"><span class="info-label">Product</span><span class="info-value">${opts.productTitle}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge badge-success">Delivered</span></span></div>
    </div>
    ${deliverySection}
    <p style="margin-top:16px;">Log in to your account to view the full delivery details and download your receipt.</p>
  `;
  return sendEmail(
    to,
    `Order Delivered — #${opts.orderId.slice(0, 8).toUpperCase()}`,
    layout("Order Delivered", body)
  );
}

// ---------------------------------------------------------------------------
// Password reset email
// ---------------------------------------------------------------------------

export function sendPasswordResetEmail(
  to: string,
  opts: { resetToken: string; origin: string }
): Promise<boolean> {
  const resetUrl = `${opts.origin}/reset-password?token=${opts.resetToken}`;
  const body = `
    <h2>Reset Your Password 🔑</h2>
    <p>We received a request to reset your Buznify account password. Click the button below to set a new password:</p>
    <p style="text-align:center;"><a class="btn" href="${resetUrl}">Reset Password</a></p>
    <p>Or copy this link into your browser:</p>
    <div class="info-box"><p style="margin:0;font-size:13px;word-break:break-all;color:#a78bfa;">${resetUrl}</p></div>
    <p><strong>This link expires in 1 hour.</strong> If you did not request a password reset, you can safely ignore this email.</p>
  `;
  return sendEmail(to, "Reset Your Buznify Password", layout("Password Reset", body));
}

// ---------------------------------------------------------------------------
// 2FA OTP email (backup channel)
// ---------------------------------------------------------------------------

export function send2FABackupEmail(
  to: string,
  opts: { code: string; name: string }
): Promise<boolean> {
  const body = `
    <h2>Two-Factor Authentication Code</h2>
    <p>Hi ${opts.name}, use the code below to complete your login:</p>
    <div class="otp-box">
      <div class="otp-code">${opts.code}</div>
      <p style="margin:8px 0 0;font-size:13px;color:#64748b;">Expires in 30 seconds</p>
    </div>
    <p>If you did not attempt to log in, please secure your account immediately by changing your password.</p>
  `;
  return sendEmail(to, "Your Buznify Login Code", layout("Login Verification", body));
}

/** Send email address verification link */
export async function sendEmailVerificationEmail(
  to: string,
  opts: { verifyToken: string; origin: string; name?: string }
): Promise<void> {
  const verifyUrl = `${opts.origin}/verify-email?token=${opts.verifyToken}`;
  const body = `
    <h1 style="color:#a78bfa;margin:0 0 8px">Verify your email</h1>
    <p style="color:#94a3b8;margin:0 0 24px">Hi ${opts.name ?? "there"}, please confirm your email address to unlock all features.</p>
    <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Verify Email Address</a>
    <p style="color:#64748b;font-size:13px;margin:24px 0 0">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>
    <p style="color:#64748b;font-size:12px;margin:8px 0 0">Or copy this link: <span style="color:#a78bfa">${verifyUrl}</span></p>
  `;
  const html = layout("Verify your email", body);
  await sendEmail(to, "Verify your Buznify email address", html);
}
