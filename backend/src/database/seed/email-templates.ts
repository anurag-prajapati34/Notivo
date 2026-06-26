// seed-email-templates.ts

import { db } from "../connection";
import { emailTemplates, emailTemplateVariables } from "../schema";

export const emailTemplateSeeds = [
  {
    name: "OTP Verification",
    slug: "otp-verification",
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
    slug: "welcome-email",
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
    slug: "password-reset",
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
