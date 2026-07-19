// seed-email-templates.ts

import { db } from "../connection";
import { emailTemplates, emailTemplateVariables } from "../schema";

export const slugs = {
  otpVerification: "otp-verification",
  welcomeEmail: "welcome-email",
  passwordReset: "password-reset",
  smtpTestEmail: "smtp-test-email",
  sendgridTestEmail: "sendgrid-test-email",
};
export const emailTemplateSeeds = [
  {
    name: "OTP Verification",
    slug: slugs.otpVerification,
    subject: "Your verification code is {{otp}}",
    html: `
      <h2>Hello {{name}},</h2>

      <p>Your verification code is:</p>

      <h1>{{otp}}</h1>

      <p>This OTP will expire in {{expiryMinutes}} minutes.</p>

      <p>If you didn't request this code, please ignore this email.</p>
    `,
    variables: ["name", "otp", "expiryMinutes"],
  },

  {
    name: "Welcome Email",
    slug: slugs.welcomeEmail,
    subject: "Welcome to {{platformName}} 🎉",
    html: `
      <h2>Welcome {{name}}!</h2>

      <p>We're excited to have you onboard.</p>

      <p>Start exploring all the amazing features available in {{platformName}}.</p>

      <p>Happy Building 🚀</p>
    `,
    variables: ["name", "platformName"],
  },

  {
    name: "Password Reset",
    slug: slugs.passwordReset,
    subject: "Reset your password",
    html: `
      <h2>Hello {{name}}</h2>

      <p>You requested a password reset.</p>

      <a href="{{resetLink}}">
        Reset Password
      </a>
    `,
    variables: ["name", "resetLink"],
  },
  {
    name: "SMTP Test Email",
    slug: slugs.smtpTestEmail,
    subject: "SMTP Test Email from {{platformName}}",
    html: `
    <h2>SMTP Test Successful ✅</h2>

    <p>Hello {{name}},</p>

    <p>
      This is a test email from <strong>{{platformName}}</strong>.
    </p>

    <p>
      If you received this email, your SMTP configuration is working correctly.
    </p>

    <p>
      Sent at: <strong>{{timestamp}}</strong>
    </p>

    <hr />

    <p style="color:#666;font-size:12px;">
      This email was automatically generated to verify your SMTP credentials.
      No action is required.
    </p>
  `,
    variables: ["name", "platformName", "timestamp"],
  },
  {
    name: "Sendgrid Test Email",
    slug: slugs.sendgridTestEmail,
    subject: "Sendgrid Test Email from {{platformName}}",
    html: `
    <h2>Sendgrid Test Successful ✅</h2>

    <p>Hello {{name}},</p>

    <p>
      This is a test email from <strong>{{platformName}}</strong>.
    </p>

    <p>
      If you received this email, your Sendgrid configuration is working correctly.
    </p>

    <p>
      Sent at: <strong>{{timestamp}}</strong>
    </p>

    <hr />

    <p style="color:#666;font-size:12px;">
      This email was automatically generated to verify your Sendgrid credentials.
      No action is required.
    </p>
  `,
    variables: ["name", "platformName", "timestamp"],
  },
];

const generateTemplateId = (name: string, slug: string) => {
  return `${name}-${slug}`.replace(/\s+/g, "").toLowerCase();
};

export const seedEmailTemplates = async () => {
  for (const template of emailTemplateSeeds) {
    await db.transaction(async (trx) => {
      const templateId = generateTemplateId(template.name, template.slug);
      await trx
        .insert(emailTemplates)
        .values({
          templateId,
          name: template.name,
          slug: template.slug,
          subject: template.subject,
          html: template.html,
        })
        .onDuplicateKeyUpdate({
          set: {
            name: template.name,
            slug: template.slug,
            subject: template.subject,
            html: template.html,
          },
        });
      await trx
        .insert(emailTemplateVariables)
        .values(
          template.variables.map((variable) => ({
            templateId,
            variableName: variable,
            isRequired: true,
          })),
        )
        .onDuplicateKeyUpdate({
          set: {
            isRequired: true,
          },
        });
    });
  }
};
