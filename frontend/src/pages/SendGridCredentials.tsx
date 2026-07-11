import {
    Check,
    Copy,
    ExternalLink,
    Eye,
    EyeOff,
    Info,
    Key,
    Mail,
    RefreshCw,
    Save,
    Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    generateApiKeyApi,
    getApiKeyApi,
    getEmailCredsApi,
    setEmailCredsApi
} from "../apis/creds.api";
import { emailProviders } from "../utils/enum";
import { sendTestEmailApi } from "../apis/email.api";

// ─── Sub-components (same as existing Credentials page) ──────────────────────

const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white border border-gray-400 p-6 mb-4">
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
            <div className={`w-7 h-7 flex items-center justify-center ${iconBg}`}>
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
            className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-400 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
        />
        {rightElement && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {rightElement}
            </div>
        )}
    </div>
);

const Divider = () => <hr className="border-gray-100 my-5" />;

// ─── SendGrid Credentials Page ────────────────────────────────────────────────

interface SendGridForm {
    fromName: string
    fromEmail: string
    sendGridApiKey: string
}

export const SendGridCredentials = () => {
    const [form, setForm] = useState<SendGridForm>({
        fromName: "",
        fromEmail: "",
        sendGridApiKey: "",
    })

    // UI states
    const [showApiKey, setShowApiKey] = useState(false)
    const [notivApiKey, setNotivApiKey] = useState<string>("")
    const [isCopied, setIsCopied] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [isTestSending, setIsTestSending] = useState(false)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)

    // ── Fetch existing creds on mount ──

    useEffect(() => {
        const fetchCreds = async () => {
            const [{ data: apiKeyData }, { data: emailCredsData }] = await Promise.all([
                getApiKeyApi(),
                getEmailCredsApi(),
            ])

            if (apiKeyData?.apiKey) {
                setNotivApiKey(apiKeyData.apiKey)
            }

            if (emailCredsData && emailCredsData.provider.toLowerCase() === 'sendgrid') {
                const { creds } = emailCredsData
                setForm({
                    fromName: creds.name || "",
                    fromEmail: creds.email || "",
                    sendGridApiKey: (creds as any).apiKey || "",
                })
            }
        }

        fetchCreds()
    }, [])

    // ── Handlers ──

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        if (!form.fromEmail.trim() || !form.sendGridApiKey.trim()) return

        setIsSaving(true)
        try {
            const res = await setEmailCredsApi({
                provider: emailProviders.SENDGRID,
                creds: {
                    name: form.fromName,
                    email: form.fromEmail,
                    apiKey: form.sendGridApiKey,
                }

            })

            if (res?.success) {
                setIsSaved(true)
                toast.success("SendGrid credentials saved successfully")
                setTimeout(() => setIsSaved(false), 3000)
            } else {
                toast.error("Failed to save credentials")
            }
        } catch {
            toast.error("Failed to save credentials")
        } finally {
            setIsSaving(false)
        }
    }

    const handleTestEmail = async () => {
        if (!form.fromEmail.trim() || !form.sendGridApiKey.trim()) {
            toast.error("Save your credentials before sending a test email")
            return
        }

        setIsTestSending(true)
        try {
            const response = await sendTestEmailApi({
                provider: emailProviders.SENDGRID,
                creds: {
                    name: form.fromName,
                    email: form.fromEmail,
                    apiKey: form.sendGridApiKey,
                }

            })

            if (response?.success) {
                toast.success("Test email sent — check your inbox")
            } else {
                toast.error("Test email failed")
            }
        } catch {
            toast.error("Test email failed")
        } finally {
            setIsTestSending(false)
        }
    }

    const handleCopyNotivApiKey = async () => {
        if (!notivApiKey) return
        await navigator.clipboard.writeText(notivApiKey)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    const handleGenerateApiKey = async () => {
        try {
            const result = await generateApiKeyApi()
            if (result?.data?.apiKey) {
                setNotivApiKey(result.data.apiKey)
                toast.success("API key generated")
            }
        } catch {
            toast.error("Failed to generate API key")
        }
    }

    const handleRegenerate = async () => {
        if (!showRegenerateConfirm) {
            setShowRegenerateConfirm(true)
            return
        }

        setIsRegenerating(true)
        try {
            const result = await generateApiKeyApi()
            if (result?.data?.apiKey) {
                setNotivApiKey(result.data.apiKey)
                toast.success("API key regenerated")
            }
        } catch {
            toast.error("Failed to regenerate API key")
        } finally {
            setIsRegenerating(false)
            setShowRegenerateConfirm(false)
        }
    }

    // ── Derived ──

    const maskedNotivKey = notivApiKey
        ? `${notivApiKey.slice(0, 14)}${"•".repeat(32)}${notivApiKey.slice(-6)}`
        : ""

    const maskedSendGridKey = form.sendGridApiKey
        ? `${form.sendGridApiKey.slice(0, 6)}${"•".repeat(20)}${form.sendGridApiKey.slice(-4)}`
        : ""

    const isFormValid =
        form.fromEmail.trim().length > 0 && form.sendGridApiKey.trim().length > 0

    return (
        <main>
            <div className="max-w-2xl">
                {/* Page header */}
                <div className="mb-6">
                    <h1 className="text-lg font-medium text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage your SendGrid credentials and API access.
                    </p>
                </div>

                {/* ── SendGrid Section ── */}
                <SectionCard>
                    <SectionHeader
                        icon={<Mail size={14} />}
                        iconBg="bg-gray-50"
                        iconColor="text-gray-500"
                        title="SendGrid configuration"
                        description="Emails are sent via SendGrid's HTTP API — works on all hosting platforms."
                    />

                    {/* Info banner */}
                    <div className="flex gap-2.5 bg-blue-50 border border-blue-100 px-3.5 py-2.5 mb-5">
                        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Get your free API key at{" "}
                            <a
                                href="https://sendgrid.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium underline underline-offset-2 inline-flex items-center gap-0.5"
                            >
                                sendgrid.com
                                <ExternalLink size={10} />
                            </a>
                            . Free tier allows 100 emails/day. You also need to verify your
                            sender email in SendGrid under{" "}
                            <span className="font-medium">
                                Settings → Sender Authentication
                            </span>
                            .
                        </p>
                    </div>

                    {/* Row 1 — From name + From email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                            <FieldLabel>From name</FieldLabel>
                            <Input
                                name="fromName"
                                placeholder="Notivo"
                                value={form.fromName}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div>
                            <FieldLabel>From email</FieldLabel>
                            <Input
                                name="fromEmail"
                                type="email"
                                placeholder="hello@yourdomain.com"
                                value={form.fromEmail}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>

                    {/* Row 2 — SendGrid API Key */}
                    <div className="mb-5">
                        <FieldLabel>SendGrid API key</FieldLabel>
                        <Input
                            name="sendGridApiKey"
                            type={showApiKey ? "text" : "password"}
                            placeholder="SG.xxxxxxxxxxxxxxxxxxxx"
                            value={form.sendGridApiKey}
                            onChange={handleFormChange}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey((p) => !p)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            }
                        />
                        {form.sendGridApiKey && !showApiKey && (
                            <p className="text-xs text-gray-400 mt-1.5">
                                {maskedSendGridKey}
                            </p>
                        )}
                    </div>

                    <Divider />

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={!isFormValid || isSaving}
                            className="h-9 px-4 bg-gray-950 text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaving ? (
                                <RefreshCw size={13} className="animate-spin" />
                            ) : (
                                <Save size={13} />
                            )}
                            {isSaving ? "Saving..." : "Save credentials"}
                        </button>

                        <button
                            onClick={handleTestEmail}
                            disabled={isTestSending || !isFormValid}
                            className="h-9 px-4 bg-white text-gray-700 text-sm font-medium border border-gray-400 flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isTestSending ? (
                                <RefreshCw size={13} className="animate-spin" />
                            ) : (
                                <Send size={13} />
                            )}
                            {isTestSending ? "Sending..." : "Send test email"}
                        </button>

                        {isSaved && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <Check size={13} />
                                Saved
                            </span>
                        )}
                    </div>
                </SectionCard>

                {/* ── Notivo API Key Section ── */}
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

                        {notivApiKey ? (
                            <div className="flex gap-2">
                                <div className="flex-1 h-9 px-3 bg-gray-50 border border-gray-400 flex items-center font-mono text-xs text-gray-500 overflow-hidden">
                                    <span className="truncate">{maskedNotivKey}</span>
                                </div>
                                <button
                                    onClick={handleCopyNotivApiKey}
                                    className="h-9 px-3 bg-white border border-gray-400 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
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
                                <div className="flex-1 h-9 px-3 bg-gray-50 border border-gray-400 flex items-center text-xs text-gray-400">
                                    No API key generated yet
                                </div>
                                <button
                                    onClick={handleGenerateApiKey}
                                    className="h-9 px-3 bg-gray-950 text-white flex items-center gap-1.5 text-xs font-medium hover:bg-gray-700 transition-colors shrink-0"
                                >
                                    <Key size={13} />
                                    Generate key
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Code snippet */}
                    {notivApiKey && (
                        <div className="mb-5">
                            <FieldLabel>Example usage</FieldLabel>
                            <div className="bg-gray-950 px-4 py-3 font-mono text-xs leading-relaxed">
                                <span className="text-gray-500">POST </span>
                                <span className="text-gray-400">
                                    https://notivo.app/api/v1/send
                                </span>
                                <br />
                                <span className="text-gray-500">Authorization: </span>
                                <span className="text-emerald-400">Bearer {maskedNotivKey}</span>
                                <br />
                                <span className="text-gray-500">Content-Type: </span>
                                <span className="text-gray-300">application/json</span>
                                <br />
                                <br />
                                <span className="text-gray-500">{"{"}</span>
                                <br />
                                <span className="text-gray-500">{"  "}</span>
                                <span className="text-blue-400">"templateId"</span>
                                <span className="text-gray-500">: </span>
                                <span className="text-amber-400">"welcome-email"</span>
                                <span className="text-gray-500">,</span>
                                <br />
                                <span className="text-gray-500">{"  "}</span>
                                <span className="text-blue-400">"recipients"</span>
                                <span className="text-gray-500">: [</span>
                                <span className="text-amber-400">"user@example.com"</span>
                                <span className="text-gray-500">],</span>
                                <br />
                                <span className="text-gray-500">{"  "}</span>
                                <span className="text-blue-400">"variables"</span>
                                <span className="text-gray-500">: [{"{"}</span>
                                <span className="text-blue-400">"variableName"</span>
                                <span className="text-gray-500">: </span>
                                <span className="text-amber-400">"name"</span>
                                <span className="text-gray-500">, </span>
                                <span className="text-blue-400">"variableValue"</span>
                                <span className="text-gray-500">: </span>
                                <span className="text-amber-400">"Anurag"</span>
                                <span className="text-gray-500">{"}]"}</span>
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
                                disabled={!notivApiKey}
                                className="h-9 px-4 bg-white text-red-500 text-sm font-medium border border-red-200 flex items-center gap-1.5 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                                    className="h-8 px-3 bg-red-600 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {isRegenerating && (
                                        <RefreshCw size={12} className="animate-spin" />
                                    )}
                                    {isRegenerating ? "Regenerating..." : "Yes, regenerate"}
                                </button>
                                <button
                                    onClick={() => setShowRegenerateConfirm(false)}
                                    className="h-8 px-3 bg-white text-gray-600 text-xs font-medium border border-gray-400 hover:bg-gray-50 transition-colors"
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
    )
}