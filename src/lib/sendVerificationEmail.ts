// src/lib/email/sendVerificationEmail.ts
import { db } from "@/lib/db";
import { emailVerificationTokens } from "@/lib/db/schema";
import { randomBytes } from "crypto";
import nodemailer, { Transporter } from "nodemailer";
import "server-only";

type Env = {
  NEXTAUTH_URL: string;
  EMAIL_SERVER_HOST: string;
  EMAIL_SERVER_PORT: string;
  EMAIL_SERVER_USER: string;
  EMAIL_SERVER_PASSWORD: string;
  EMAIL_FROM: string;
  EMAIL_REPLY_TO?: string;
  BRAND_LOGO_URL?: string; // https://cdn.../logo.png
  BRAND_NAME?: string; // defaults to "StockAmplify"
};

function mustGetEnv(): Env {
  const env = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
    BRAND_LOGO_URL: process.env.BRAND_LOGO_URL,
    BRAND_NAME: process.env.BRAND_NAME ?? "StockAmplify",
  } as Env;

  for (const [k, v] of Object.entries(env)) {
    if (!v && !["EMAIL_REPLY_TO", "BRAND_LOGO_URL", "BRAND_NAME"].includes(k)) {
      throw new Error(`Missing required env var: ${k}`);
    }
  }
  return env;
}

let cachedTransporter: Transporter | null = null;
function getTransporter(env: Env): Transporter {
  if (cachedTransporter) return cachedTransporter;
  const port = Number(env.EMAIL_SERVER_PORT);
  const secure = port === 465; // SSL on 465; STARTTLS on 587

  cachedTransporter = nodemailer.createTransport({
    host: env.EMAIL_SERVER_HOST,
    port,
    secure,
    auth: { user: env.EMAIL_SERVER_USER, pass: env.EMAIL_SERVER_PASSWORD },
  });
  return cachedTransporter;
}

function buildVerifyUrls(email: string, token: string, baseUrl: string) {
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(email)}`;
  const { host } = new URL(baseUrl);
  return { verifyUrl, host };
}

/* =======================
   StockAmplify Brand Theme
   ======================= */
const PALETTE = {
  // pulled from your sign-in page
  slate900: "#0f172a",
  slate800: "#1f2937",
  slate600: "#475569",
  slate200: "#e5e7eb",
  indigo500: "#6366F1",
  fuchsia500: "#D946EF",
  white: "#ffffff",
};

function preheader(text: string) {
  // improves inbox preview
  return `
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;">
    ${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
  </div>`;
}

function logoOrSymbol(brandName: string, logoUrl?: string) {
  if (logoUrl) {
    return `<img src="${logoUrl}" width="40" height="40" alt="${brandName} logo" style="display:block;border:0;outline:none;border-radius:10px;" />`;
  }
  // fallback "SA" symbol
  return `
    <div style="width:40px;height:40px;border-radius:10px;
      background:${PALETTE.indigo500};
      display:flex;align-items:center;justify-content:center;
      color:${PALETTE.white};font-weight:700;font-family:Inter,Arial;">
      SA
    </div>`;
}

function renderHtml(
  host: string,
  verifyUrl: string,
  brandName: string,
  logoUrl?: string
) {
  // NOTE: gradients in email are spotty; we provide solid fallbacks.
  const brandBarStyle =
    `background:${PALETTE.indigo500};` +
    `background:linear-gradient(90deg, ${PALETTE.indigo500}, ${PALETTE.fuchsia500});`;

  const gradientUnderline =
    `background:${PALETTE.indigo500};` +
    `background:linear-gradient(90deg, ${PALETTE.indigo500}, ${PALETTE.fuchsia500});`;

  const buttonBg = `background:${PALETTE.indigo500};`; // solid for Outlook
  const buttonGradient =
    `background:${PALETTE.indigo500};` +
    `background:linear-gradient(90deg, ${PALETTE.indigo500}, ${PALETTE.fuchsia500});`;

  return `
  ${preheader("Verify your email to start using StockAmplify")}
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:${PALETTE.slate200};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:620px;">
          <!-- Brand Header (gradient with fallback) -->
          <tr>
            <td style="padding:0;border-radius:16px 16px 0 0; ${brandBarStyle}">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:14px 18px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;">${logoOrSymbol(brandName, logoUrl)}</td>
                        <td style="vertical-align:middle;padding-left:12px;">
                          <div style="font-family:Inter,Segoe UI,Arial;font-weight:700;font-size:16px;color:${PALETTE.white};letter-spacing:0.2px;">
                            ${brandName}
                          </div>
                          <div style="font-family:Inter,Segoe UI,Arial;font-size:12px;color:#E9E9FF;opacity:0.95;">
                            Stock Research • Simplified • Amplified
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:${PALETTE.white};border:1px solid ${PALETTE.slate200};border-top:none;border-radius:0 0 16px 16px;padding:24px;">
              <h1 style="margin:0 0 6px;font-family:Inter,Segoe UI,Arial;font-size:22px;line-height:1.3;color:${PALETTE.slate800};">
                Verify your email
              </h1>
              <!-- gradient underline like your page -->
              <div style="height:4px;width:96px;border-radius:9999px;margin:10px 0 16px; ${gradientUnderline}"></div>

              <p style="margin:0 0 18px;font-family:Inter,Segoe UI,Arial;font-size:14px;line-height:1.6;color:${PALETTE.slate600};">
                Click the button below to verify your account on <strong>${host}</strong> and continue to StockAmplify.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0;">
                <tr>
                  <td align="center" style="border-radius:10px; ${buttonBg}">
                    <a href="${verifyUrl}" target="_blank"
                      style="${buttonGradient};display:inline-block;padding:12px 20px;border-radius:10px;
                      font-family:Inter,Segoe UI,Arial;font-size:14px;font-weight:600;color:${PALETTE.white};text-decoration:none;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 10px;font-family:Inter,Segoe UI,Arial;font-size:12px;color:${PALETTE.slate600};">
                Or paste this link into your browser:
              </p>
              <p style="word-break:break-all;margin:0 0 18px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:${PALETTE.slate600};">
                ${verifyUrl}
              </p>

              <hr style="border:none;border-top:1px solid ${PALETTE.slate200};margin:16px 0;" />

              <p style="margin:0;font-family:Inter,Segoe UI,Arial;font-size:12px;color:${PALETTE.slate600};">
                If you didn’t request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:12px 8px;text-align:center;">
              <div style="font-family:Inter,Segoe UI,Arial;font-size:11px;color:#94a3b8;">
                © ${new Date().getFullYear()} ${brandName}. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>`;
}

function renderText(host: string, verifyUrl: string, brandName: string) {
  return `${brandName} — Email Verification

Verify your email on ${host}

Open this link:
${verifyUrl}

If you didn’t request this, you can ignore this email.
`;
}

/* ================
   Public API
   ================ */
export async function sendVerificationEmail(email: string) {
  const env = mustGetEnv();

  // 1) Create & store token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await db.insert(emailVerificationTokens).values({ email, token, expiresAt });

  // 2) Build URLs + templates
  const { verifyUrl, host } = buildVerifyUrls(email, token, env.NEXTAUTH_URL);
  const html = renderHtml(
    host,
    verifyUrl,
    env.BRAND_NAME ?? "StockAmplify",
    env.BRAND_LOGO_URL
  );
  const text = renderText(host, verifyUrl, env.BRAND_NAME ?? "StockAmplify");

  // 3) Send
  const transporter = getTransporter(env);
  await transporter.sendMail({
    from: env.EMAIL_FROM, // for Gmail, use the authenticated account or a verified alias
    to: email,
    subject: `Verify your email on ${host}`,
    html,
    text,
    ...(env.EMAIL_REPLY_TO ? { replyTo: env.EMAIL_REPLY_TO } : {}),
  });
}
