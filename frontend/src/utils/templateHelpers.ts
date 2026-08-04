export const extractVariables = (html: string, subject: string): string[] => {
  const regex = /\{\{(\w+)\}\}/g;
  const vars = new Set<string>();
  let match;
  while ((match = regex.exec(html)) !== null) vars.add(match[1]);
  regex.lastIndex = 0;
  while ((match = regex.exec(subject)) !== null) vars.add(match[1]);
  return Array.from(vars);
};

export const BLANK_TEMPLATE = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f4f4f4; }
.container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
.body { padding: 32px; }
.body p { color: #6b7280; font-size: 15px; line-height: 1.6; }
</style></head>
<body>
  <div class="container">
    <div class="body">
      <p>Hello {{name}},</p>
      <p>Write your email content here.</p>
    </div>
  </div>
</body>
</html>`;

export const SIMPLE_TEMPLATE = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f9fafb; color: #111827; }
.container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; }
h1 { font-size: 20px; font-weight: 600; margin-top: 0; }
p { font-size: 14px; line-height: 1.5; color: #4b5563; }
</style></head>
<body>
  <div class="container">
    <h1>Hello {{name}},</h1>
    <p>This is a simple email template. You can customize this message as needed.</p>
    <p>Best regards,<br>The {{appName}} Team</p>
  </div>
</body>
</html>`;

export const WELCOME_TEMPLATE = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; }
.container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.header { background: #6366f1; padding: 32px; text-align: center; }
.header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
.body { padding: 32px; color: #374151; line-height: 1.6; }
.body h2 { color: #111827; font-size: 18px; margin-top: 0; }
.button { display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 16px; }
.footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {{appName}}!</h1>
    </div>
    <div class="body">
      <h2>Hello {{name}},</h2>
      <p>We're thrilled to have you on board! Thank you for joining {{appName}}. Get started by exploring your account dashboard.</p>
      <a href="#" class="button">Get Started</a>
    </div>
    <div class="footer">
      <p>&copy; {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

export const OTP_TEMPLATE = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; }
.container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; }
.icon { width: 56px; height: 56px; background: #eef2ff; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; font-size: 24px; }
h1 { color: #111827; font-size: 22px; margin: 0 0 8px 0; }
p { color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0; }
.otp-code { background: #f8fafc; border: 2px dashed #6366f1; border-radius: 8px; padding: 16px 24px; font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4338ca; display: inline-block; margin: 8px 0 24px 0; }
.footer { font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 24px; }
</style></head>
<body>
  <div class="container">
    <div class="icon">🔒</div>
    <h1>Verification Code</h1>
    <p>Hello {{name}}, use the security code below to verify your account. This code is valid for {{expiryMinutes}} minutes.</p>
    <div class="otp-code">{{otp}}</div>
    <p style="font-size: 12px; color: #9ca3af;">If you didn't request this code, please ignore this email.</p>
    <div class="footer">
      <p>This is an automated security notification.</p>
    </div>
  </div>
</body>
</html>`;
