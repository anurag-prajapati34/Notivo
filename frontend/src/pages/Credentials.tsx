import { useEffect, useState } from "react";
import {
    Mail,
    Key,
    Copy,
    Check,
    RefreshCw,
    Save,
    Send,
    Info,
    Eye,
    EyeOff,
} from "lucide-react";
import { generateApiKeyApi, getApiKeyApi, getEmailCredsApi, setEmailCredsApi } from "../apis/creds.api";
import type { EmailCreds, SmtpForm } from "../types";
import { sendTestEmailApi } from "../apis/email.api";



// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        {children}
    </div>
);

const SectionHeader = ({
    icon,
    iconBg,
    iconColor,
    title,
    description,
}: {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    title: string;
    description: React.ReactNode;
}) => (
    <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center ${iconBg}`}>
                <span className={iconColor}>{icon}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-9">{description}</p>
    </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {children}
    </label>
);

const Input = ({
    type = "text",
    placeholder,
    value,
    name,
    onChange,
    rightElement,
}: {
    type?: string;
    placeholder?: string;
    value: string;
    name?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    rightElement?: React.ReactNode;
}) => (
    <div className="relative">
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
        {rightElement && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {rightElement}
            </div>
        )}
    </div>
);

const Divider = () => <hr className="border-gray-100 my-5" />;

// ─── Main Component ───────────────────────────────────────────────────────────

export const Credentials = () => {
    // SMTP form state
    const [smtpForm, setSmtpForm] = useState<SmtpForm>({
        fromName: "",
        fromEmail: "",
        host: "smtp.gmail.com",
        port: 465,
        username: "",
        passKey: "",
    });

    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [apiKey, setApiKey] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false);
    const [isSmtpSaving, setIsSmtpSaving] = useState(false);
    const [isTestSending, setIsTestSending] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [smtpSaved, setSmtpSaved] = useState(false);
    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

    // ── Handlers ──

    const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSmtpForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveSmtp = async () => {
        const { fromEmail, passKey } = smtpForm;
        if (!fromEmail.trim() || !passKey.trim()) return;

        setIsSmtpSaving(true);
        try {
            const creds: EmailCreds = { email: fromEmail, passKey, host: smtpForm.host, port: smtpForm.port, username: smtpForm.username, name: smtpForm.fromName, secure: smtpForm.port === 465 };

            console.log("creds-----", creds)
            await setEmailCredsApi(creds);
            setSmtpSaved(true);
            setTimeout(() => setSmtpSaved(false), 3000);
        } catch (err) {
            console.error("Failed to save SMTP credentials", err);
        } finally {
            setIsSmtpSaving(false);
        }
    };

    const handleTestEmail = async () => {
        setIsTestSending(true);
        try {
            // Call your test email endpoint here
            // await sendTestEmailApi();
            await sendTestEmailApi({
                email: smtpForm.fromEmail,
                name: smtpForm.fromName,
                host: smtpForm.host,
                port: smtpForm.port,
                secure: smtpForm.port === 465,
                username: smtpForm.username,
                passKey: smtpForm.passKey
            });
            await new Promise((r) => setTimeout(r, 1500)); // placeholder
        } catch (err) {
            console.error("Test email failed", err);
        } finally {
            setIsTestSending(false);
        }
    };

    const handleGetApiKey = async () => {
        try {

            const result = await generateApiKeyApi();
            if (result?.data?.apiKey) {
                setApiKey(result.data.apiKey);
            }
        } catch (err) {
            console.error("Failed to get API key", err);
        }
    };

    const handleCopyApiKey = async () => {
        if (!apiKey) return;
        await navigator.clipboard.writeText(apiKey);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleRegenerate = async () => {
        if (!showRegenerateConfirm) {
            setShowRegenerateConfirm(true);
            return;
        }
        setIsRegenerating(true);
        try {
            const result = await generateApiKeyApi(); // replace with regenerate API
            if (result?.data?.apiKey) {
                setApiKey(result.data.apiKey);
            }
        } catch (err) {
            console.error("Failed to regenerate API key", err);
        } finally {
            setIsRegenerating(false);
            setShowRegenerateConfirm(false);
        }
    };

    // ── Effects ──

    useEffect(() => {
        async function fetchCreds() {
            const [{ data: apiKeyData }, { data: emailCredsData }] = await Promise.all([
                getApiKeyApi(),
                getEmailCredsApi()

            ])


            console.log("emailCredsData ----", emailCredsData)

            if (apiKeyData?.apiKey) {
                setApiKey(apiKeyData.apiKey)
            }
            if (emailCredsData) {
                setSmtpForm({
                    fromName: emailCredsData?.name || '',
                    fromEmail: emailCredsData?.email || '',
                    host: emailCredsData?.host || '',
                    port: emailCredsData?.port || 465,
                    username: emailCredsData?.username || '',
                    passKey: emailCredsData?.passKey || ''
                })
            }

        }
        fetchCreds()
    }, []);

    // ── Derived values ──
    const maskedKey = apiKey
        ? `${apiKey.slice(0, 14)}${"•".repeat(32)}${apiKey.slice(-6)}`
        : "";

    const isSmtpFormValid =
        smtpForm.fromEmail.trim().length > 0 && smtpForm.passKey.trim().length > 0;

    // ── Render ──

    return (
        <main>
            <div className="max-w-2xl">
                {/* Page header */}
                <div className="mb-6">
                    <h1 className="text-lg font-medium text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage your SMTP credentials and API access.
                    </p>
                </div>

                {/* ── SMTP Section ── */}
                <SectionCard>
                    <SectionHeader
                        icon={<Mail size={14} />}
                        iconBg="bg-indigo-50"
                        iconColor="text-indigo-500"
                        title="SMTP configuration"
                        description="Emails are sent using your own SMTP — your sender reputation, your quota."
                    />

                    {/* Info banner */}
                    <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-3.5 py-2.5 mb-5">
                        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Use an app password, not your account password. For Gmail go to{" "}
                            <span className="font-medium">
                                Google Account → Security → App passwords
                            </span>
                            .
                        </p>
                    </div>

                    {/* Row 1 — From name + From email */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <FieldLabel>From name</FieldLabel>
                            <Input
                                name="fromName"
                                placeholder="Acme Inc."
                                value={smtpForm.fromName}
                                onChange={handleSmtpChange}
                            />
                        </div>
                        <div>
                            <FieldLabel>From email</FieldLabel>
                            <Input
                                name="fromEmail"
                                type="email"
                                placeholder="hello@acme.com"
                                value={smtpForm.fromEmail}
                                onChange={handleSmtpChange}
                            />
                        </div>
                    </div>

                    {/* Row 2 — SMTP host + port */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="col-span-2">
                            <FieldLabel>SMTP host</FieldLabel>
                            <Input
                                name="host"
                                placeholder="smtp.gmail.com"
                                value={smtpForm.host}
                                onChange={handleSmtpChange}
                            />
                        </div>
                        <div>
                            <FieldLabel>Port</FieldLabel>
                            <Input
                                name="port"
                                placeholder="465"
                                value={smtpForm.port.toString()}
                                onChange={handleSmtpChange}
                            />
                        </div>
                    </div>

                    {/* Row 3 — Username */}
                    <div className="mb-3">
                        <FieldLabel>Username</FieldLabel>
                        <Input
                            name="username"
                            placeholder="your@gmail.com"
                            value={smtpForm.username}
                            onChange={handleSmtpChange}
                        />
                    </div>

                    {/* Row 4 — App password */}
                    <div className="mb-5">
                        <FieldLabel>App password</FieldLabel>
                        <Input
                            name="passKey"
                            type={showPassword ? "text" : "password"}
                            placeholder="xxxx xxxx xxxx xxxx"
                            value={smtpForm.passKey}
                            onChange={handleSmtpChange}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            }
                        />
                    </div>

                    <Divider />

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveSmtp}
                            disabled={!isSmtpFormValid || isSmtpSaving}
                            className="h-9 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSmtpSaving ? (
                                <RefreshCw size={13} className="animate-spin" />
                            ) : (
                                <Save size={13} />
                            )}
                            {isSmtpSaving ? "Saving..." : "Save credentials"}
                        </button>

                        <button
                            onClick={handleTestEmail}
                            disabled={isTestSending}
                            className="h-9 px-4 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isTestSending ? (
                                <RefreshCw size={13} className="animate-spin" />
                            ) : (
                                <Send size={13} />
                            )}
                            {isTestSending ? "Sending..." : "Send test email"}
                        </button>

                        {/* Saved confirmation */}
                        {smtpSaved && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <Check size={13} />
                                Saved
                            </span>
                        )}
                    </div>
                </SectionCard>

                {/* ── API Key Section ── */}
                <SectionCard>
                    <SectionHeader
                        icon={<Key size={14} />}
                        iconBg="bg-amber-50"
                        iconColor="text-amber-500"
                        title="API key"
                        description={
                            <>
                                Use this in the{" "}
                                <code className="font-mono text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                    Authorization: Bearer
                                </code>{" "}
                                header when calling the Notivo API.
                            </>
                        }
                    />

                    {/* API key display */}
                    <div className="mb-4">
                        <FieldLabel>Your API key</FieldLabel>

                        {apiKey ? (
                            <div className="flex gap-2">
                                <div className="flex-1 h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center font-mono text-xs text-gray-500 overflow-hidden">
                                    <span className="truncate">{maskedKey}</span>
                                </div>
                                <button
                                    onClick={handleCopyApiKey}
                                    className="h-9 px-3 bg-white border border-gray-200 rounded-lg flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
                                >
                                    {isCopied ? (
                                        <>
                                            <Check size={13} className="text-emerald-500" />
                                            <span className="text-emerald-600">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={13} />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <div className="flex-1 h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center text-xs text-gray-400">
                                    No API key generated yet
                                </div>
                                <button
                                    onClick={handleGetApiKey}
                                    className="h-9 px-3 bg-indigo-600 text-white rounded-lg flex items-center gap-1.5 text-xs font-medium hover:bg-indigo-700 transition-colors shrink-0"
                                >
                                    <Key size={13} />
                                    Generate key
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Code snippet */}
                    {apiKey && (
                        <div className="mb-5">
                            <FieldLabel>Example usage</FieldLabel>
                            <div className="bg-gray-950 rounded-lg px-4 py-3 font-mono text-xs leading-relaxed">
                                <span className="text-gray-500">POST </span>
                                <span className="text-indigo-400">
                                    https://notivo.app/api/v1/send
                                </span>
                                <br />
                                <span className="text-gray-500">Authorization: </span>
                                <span className="text-emerald-400">Bearer {maskedKey}</span>
                                <br />
                                <span className="text-gray-500">Content-Type: </span>
                                <span className="text-gray-300">application/json</span>
                                <br />
                                <br />
                                <span className="text-gray-500">{"{"}</span>
                                <br />
                                <span className="text-gray-500">{"  "}</span>
                                <span className="text-blue-400">"to"</span>
                                <span className="text-gray-500">: </span>
                                <span className="text-amber-400">"user@example.com"</span>
                                <span className="text-gray-500">,</span>
                                <br />
                                <span className="text-gray-500">{"  "}</span>
                                <span className="text-blue-400">"templateId"</span>
                                <span className="text-gray-500">: </span>
                                <span className="text-amber-400">"welcome-email"</span>
                                <span className="text-gray-500">,</span>
                                <br />
                                <span className="text-gray-500">{"  "}</span>
                                <span className="text-blue-400">"data"</span>
                                <span className="text-gray-500">{": { "}</span>
                                <span className="text-blue-400">"name"</span>
                                <span className="text-gray-500">: </span>
                                <span className="text-amber-400">"Rahul"</span>
                                <span className="text-gray-500">{" }"}</span>
                                <br />
                                <span className="text-gray-500">{"}"}</span>
                            </div>
                        </div>
                    )}

                    <Divider />

                    {/* Regenerate */}
                    <div className="flex items-center gap-3">
                        {!showRegenerateConfirm ? (
                            <button
                                onClick={handleRegenerate}
                                disabled={!apiKey}
                                className="h-9 px-4 bg-white text-red-500 text-sm font-medium rounded-lg border border-red-200 flex items-center gap-1.5 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <RefreshCw size={13} />
                                Regenerate key
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    This will invalidate your current key. Are you sure?
                                </span>
                                <button
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                    className="h-8 px-3 bg-red-600 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {isRegenerating ? (
                                        <RefreshCw size={12} className="animate-spin" />
                                    ) : null}
                                    {isRegenerating ? "Regenerating..." : "Yes, regenerate"}
                                </button>
                                <button
                                    onClick={() => setShowRegenerateConfirm(false)}
                                    className="h-8 px-3 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {!showRegenerateConfirm && (
                            <p className="text-xs text-gray-400">
                                Regenerating invalidates your current key immediately.
                            </p>
                        )}
                    </div>
                </SectionCard>
            </div>
        </main>
    );
};