// ─── pages/SendEmail.tsx ─────────────────────────────────────────────────────

import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Clock,
    Eye,
    EyeOff,
    Hash,
    LayoutTemplate,
    Loader2,
    Mail,
    Plus,
    Send,
    Users,
    Variable,
    X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { getEmailTemplatesApi, sendEmailApi } from "../apis/email.api"
import { useAuthContext } from "../hooks"
import type { EmailTemplate } from "../types"
import { handleEmailSentViaGuestAccount } from "../utils/email-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

type SendMode = "now" | "schedule"

interface FormState {
    recipients: string[]
    recipientInput: string
    selectedTemplate: EmailTemplate | null
    variables: Record<string, string>
    scheduleDate: string
    scheduleTime: string
    mode: SendMode
}

type SubmitStatus = "idle" | "loading" | "success" | "error"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

const renderTemplate = (
    template: string,
    data: Record<string, string>
): string =>
    template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match)

// ─── Sub-components ──────────────────────────────────────────────────────────

// Field label
const Label = ({
    children,
    required,
}: {
    children: React.ReactNode
    required?: boolean
}) => (
    <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {children}
        {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
)

// Input field
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full h-9 px-3 text-sm bg-white border border-gray-400 
      text-gray-900 placeholder-gray-400
      focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100
      disabled:bg-gray-50 disabled:text-gray-400
      transition-all ${props.className ?? ""}`}
    />
)

// Section card
const Card = ({
    children,
    className = "",
}: {
    children: React.ReactNode
    className?: string
}) => (
    <div className={`bg-white border border-gray-400  p-6 ${className}`}>
        {children}
    </div>
)

// Card header
const CardHeader = ({
    icon: Icon,
    title,
    subtitle,
}: {
    icon: React.ElementType
    title: string
    subtitle?: string
}) => (
    <div className="flex items-start gap-3 mb-5">
        <div className="w-8 h-8  bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={15} className="text-gray-500" />
        </div>
        <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
    </div>
)

// ─── Template selector ────────────────────────────────────────────────────────

const TemplateSelector = ({
    templates,
    selected,
    onSelect,
}: {
    templates: EmailTemplate[]
    selected: EmailTemplate | null
    onSelect: (t: EmailTemplate) => void
}) => {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node))
                setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className={`w-full h-10 px-3 flex items-center justify-between text-sm  border transition-all
          ${selected
                        ? "bg-white border-gray-400 text-gray-900"
                        : "bg-gray-50 border-gray-400 text-gray-400"
                    }
          hover:border-gray-300 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <LayoutTemplate size={14} className={selected ? "text-gray-500" : "text-gray-400"} />
                    {selected ? (
                        <span className="font-medium truncate">{selected.name}</span>
                    ) : (
                        <span>Select a template</span>
                    )}
                </div>
                <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-400  shadow-lg z-20 overflow-hidden">
                    <div className="p-1.5">
                        {templates.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-400">
                                No templates found
                            </div>
                        ) : (
                            templates.map((t) => (
                                <button
                                    key={t.templateId}
                                    type="button"
                                    onClick={() => { onSelect(t); setOpen(false) }}
                                    className={`w-full flex items-start gap-3 px-3 py-2.5  text-left transition-colors
                    ${selected?.templateId === t.templateId
                                            ? "bg-gray-50 text-gray-700"
                                            : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="w-6 h-6  bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <LayoutTemplate size={11} className="text-gray-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {t.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Hash size={9} className="text-gray-400" />
                                            <span className="text-xs text-gray-400 font-mono truncate">
                                                {t.slug}
                                            </span>
                                        </div>
                                    </div>
                                    {selected?.templateId === t.templateId && (
                                        <CheckCircle2 size={14} className="text-gray-500 shrink-0 mt-1" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Recipients input ─────────────────────────────────────────────────────────

const RecipientsInput = ({
    recipients,
    input,
    onInputChange,
    onAdd,
    onRemove,
}: {
    recipients: string[]
    input: string
    onInputChange: (v: string) => void
    onAdd: () => void
    onRemove: (email: string) => void
}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            onAdd()
        }
    }

    return (
        <div>
            <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="email"
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter recipient email and press Enter"
                        className="w-full h-9 pl-8 pr-3 text-sm bg-white border border-gray-400 
              text-gray-900 placeholder-gray-400
              focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100
              transition-all"
                    />
                </div>
                <button
                    type="button"
                    onClick={onAdd}
                    disabled={!isValidEmail(input)}
                    className="h-9 px-3 bg-gray-600 text-white text-sm  flex items-center gap-1.5
            hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                    <Plus size={14} />
                    Add
                </button>
            </div>

            {/* Recipient tags */}
            {recipients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 border border-gray-400  min-h-[42px]">
                    {recipients.map((email) => (
                        <span
                            key={email}
                            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-white border border-gray-400  text-xs text-gray-700"
                        >
                            <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-600 text-xs font-bold leading-none">
                                    {email[0].toUpperCase()}
                                </span>
                            </div>
                            {email}
                            <button
                                type="button"
                                onClick={() => onRemove(email)}
                                className="w-4 h-4 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {recipients.length > 0 && (
                <p className="text-xs text-gray-400 mt-1.5">
                    {recipients.length} recipient{recipients.length !== 1 ? "s" : ""} added
                </p>
            )}
        </div>
    )
}

// ─── Variable fields ──────────────────────────────────────────────────────────

const VariableFields = ({
    template,
    values,
    onChange,
}: {
    template: EmailTemplate
    values: Record<string, string>
    onChange: (key: string, value: string) => void
}) => {
    if (!template.variables?.length) {
        return (
            <div className="flex items-center gap-2 py-3 px-4 bg-gray-50  border border-gray-400">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <p className="text-sm text-gray-500">
                    This template has no variables — ready to send.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {template.variables.map((v) => {
                const name = typeof v === "string" ? v : v.variableName
                const required = typeof v === "string" ? true : v.isRequired

                return (
                    <div key={name}>
                        <Label required={required}>
                            <span className="font-mono text-gray-600">{`{{${name}}}`}</span>
                            <span className="ml-1.5 text-gray-500 font-sans">
                                {required ? "(required)" : "(optional)"}
                            </span>
                        </Label>
                        <Input
                            placeholder={`Value for ${name}`}
                            value={values[name] ?? ""}
                            onChange={(e) => onChange(name, e.target.value)}
                        />
                    </div>
                )
            })}
        </div>
    )
}

// ─── Email preview ────────────────────────────────────────────────────────────

const EmailPreviewPanel = ({
    template,
    variables,
    recipient,
}: {
    template: EmailTemplate
    variables: Record<string, string>
    recipient: string
}) => {
    const renderedSubject = renderTemplate(template.subject, variables)
    const renderedBody = renderTemplate(template.html, variables)

    return (
        <div className="flex flex-col h-full">
            {/* Preview meta */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-400 space-y-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-12 shrink-0">To</span>
                    <span className="text-xs text-gray-700 font-medium">
                        {recipient || "recipient@example.com"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-12 shrink-0">Subject</span>
                    <span className="text-xs text-gray-700">{renderedSubject}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-12 shrink-0">Via</span>
                    <span className="text-xs font-mono text-gray-600">{template.slug}</span>
                </div>
            </div>

            {/* Rendered HTML */}
            <iframe
                srcDoc={renderedBody}
                className="flex-1 w-full rounded-b-xl"
                title="Email preview"
                sandbox="allow-same-origin"
            />
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const SendEmail = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
    const [showPreview, setShowPreview] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle")
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [sentCount, setSentCount] = useState(0)
    const { user } = useAuthContext()

    const [form, setForm] = useState<FormState>({
        recipients: [],
        recipientInput: "",
        selectedTemplate: null,
        variables: {},
        scheduleDate: "",
        scheduleTime: "",
        mode: "now",
    })

    // Fetch templates
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getEmailTemplatesApi()
                setTemplates(res.data)
            } catch (err) {
                console.error("Failed to load templates", err)
            } finally {
                setIsLoadingTemplates(false)
            }
        }
        fetch()
    }, [])

    // ── Form handlers ──

    const handleTemplateSelect = (t: EmailTemplate) => {
        setForm((p) => ({
            ...p,
            selectedTemplate: t,
            variables: {},
        }))
        setShowPreview(false)
    }

    const handleAddRecipient = () => {
        const email = form.recipientInput.trim()
        if (!isValidEmail(email)) return
        if (form.recipients.includes(email)) return
        setForm((p) => ({
            ...p,
            recipients: [...p.recipients, email],
            recipientInput: "",
        }))
    }

    const handleRemoveRecipient = (email: string) => {
        setForm((p) => ({
            ...p,
            recipients: p.recipients.filter((r) => r !== email),
        }))
    }

    const handleVariableChange = (key: string, value: string) => {
        setForm((p) => ({
            ...p,
            variables: { ...p.variables, [key]: value },
        }))
    }

    // ── Validation ──

    const getValidationErrors = (): string[] => {
        const errors: string[] = []
        if (!form.selectedTemplate) errors.push("Select a template")
        if (form.recipients.length === 0) errors.push("Add at least one recipient")

        if (form.selectedTemplate?.variables) {
            const missing = form.selectedTemplate.variables
                .filter((v) => {
                    const name = typeof v === "string" ? v : v.variableName
                    const required = typeof v === "string" ? true : v.isRequired
                    return required && !form.variables[name]?.trim()
                })
                .map((v) => (typeof v === "string" ? v : v.variableName))

            if (missing.length > 0) {
                errors.push(`Fill required variables: ${missing.join(", ")}`)
            }
        }

        if (form.mode === "schedule" && (!form.scheduleDate || !form.scheduleTime)) {
            errors.push("Set a schedule date and time")
        }

        return errors
    }

    const validationErrors = getValidationErrors()
    const isValid = validationErrors.length === 0

    // ── Submit ──

    const handleSubmit = async () => {
        if (!isValid || !form.selectedTemplate) return

        setSubmitStatus("loading")
        setSubmitError(null)

        try {
            const scheduleAt =
                form.mode === "schedule" && form.scheduleDate && form.scheduleTime
                    ? new Date(`${form.scheduleDate}T${form.scheduleTime}`).toISOString()
                    : undefined

            // Send to all recipients
            if (form.selectedTemplate.templateId) {
                try {

                    const canSend = await handleEmailSentViaGuestAccount(
                        user
                    )

                    if (!canSend.canSend) {
                        setSubmitStatus("idle")
                        toast.error(canSend.message);
                        return
                    }

                    const parsedVariables = Object.entries(form.variables).map(
                        ([variableName, variableValue]) => ({
                            variableName,
                            variableValue,
                        })
                    );
                    const res = await sendEmailApi({
                        templateId: form.selectedTemplate.templateId,
                        variables: parsedVariables,
                        recipients: form.recipients,
                        scheduleAt,
                    })

                    if (res?.success) {
                        toast.success('Email sent successfully');
                    } else {
                        toast.error('Failed to send email');
                    }
                }
                catch (err) {
                    toast.error((err as any).message ?? 'Failed to send email');
                }


                setSentCount(form.recipients.length)
                setSubmitStatus("success")

                // Reset form after success
                setTimeout(() => {
                    setForm({
                        recipients: [],
                        recipientInput: "",
                        selectedTemplate: null,
                        variables: {},
                        scheduleDate: "",
                        scheduleTime: "",
                        mode: "now",
                    })
                    setShowPreview(false)
                    setSubmitStatus("idle")
                }, 3000)

            }
        } catch (err: any) {
            setSubmitError(
                err?.response?.data?.error ?? "Something went wrong. Please try again."
            )
            setSubmitStatus("error")
        }
    }

    // ── Min date for schedule (today) ──
    const todayStr = new Date().toISOString().split("T")[0]

    // ── Preview recipient (first one or placeholder) ──
    const previewRecipient = form.recipients[0] ?? ""

    // ── Render ──

    return (
        <main >
            <div >

                {/* Page header */}
                <div className="mb-7">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <h1 className="text-lg font-semibold text-gray-900">Send Email</h1>
                        <span className="text-xs text-gray-500 font-normal">
                            (Can't find the email? Check your Spam or Junk folder.)
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Compose and send emails directly from the platform — no API call needed.
                    </p>
                </div>

                {/* ── Success state ── */}
                {submitStatus === "success" && (
                    <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200  px-5 py-4">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-emerald-800">
                                {form.mode === "schedule"
                                    ? `${sentCount} email${sentCount !== 1 ? "s" : ""} scheduled successfully`
                                    : `${sentCount} email${sentCount !== 1 ? "s" : ""} queued for delivery`}
                            </p>
                            <p className="text-xs text-emerald-600 mt-0.5">
                                You can track delivery status in the Emails page.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Error state ── */}
                {submitStatus === "error" && submitError && (
                    <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200  px-5 py-4">
                        <AlertCircle size={18} className="text-red-500 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-red-800">Failed to send</p>
                            <p className="text-xs text-red-600 mt-0.5">{submitError}</p>
                        </div>
                        <button
                            onClick={() => setSubmitStatus("idle")}
                            className="ml-auto text-red-400 hover:text-red-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* ── Two column layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Left — Form (3/5) */}
                    <div className="col-span-1 lg:col-span-3 space-y-4">

                        {/* Template selection */}
                        <Card>
                            <CardHeader
                                icon={LayoutTemplate}
                                title="Select template"
                                subtitle="Choose the email template to send"
                            />
                            {isLoadingTemplates ? (
                                <div className="h-10 bg-gray-100  animate-pulse" />
                            ) : (
                                <TemplateSelector
                                    templates={templates}
                                    selected={form.selectedTemplate}
                                    onSelect={handleTemplateSelect}
                                />
                            )}

                            {/* Selected template info */}
                            {form.selectedTemplate && (
                                <div className="mt-3 flex items-center gap-3 px-3 py-2.5 bg-gray-50 border border-gray-100 ">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-700">
                                            <span className="font-medium">Subject preview: </span>
                                            {renderTemplate(
                                                form.selectedTemplate.subject,
                                                form.variables
                                            )}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview((p) => !p)}
                                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 font-medium shrink-0"
                                    >
                                        {showPreview ? (
                                            <><EyeOff size={12} />Hide</>
                                        ) : (
                                            <><Eye size={12} />Preview</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </Card>

                        {/* Recipients */}
                        <Card>
                            <CardHeader
                                icon={Users}
                                title="Recipients"
                                subtitle="Add one or more email addresses to send to"
                            />
                            <RecipientsInput
                                recipients={form.recipients}
                                input={form.recipientInput}
                                onInputChange={(v) =>
                                    setForm((p) => ({ ...p, recipientInput: v }))
                                }
                                onAdd={handleAddRecipient}
                                onRemove={handleRemoveRecipient}
                            />
                        </Card>

                        {/* Variables */}
                        {form.selectedTemplate && (
                            <Card>
                                <CardHeader
                                    icon={Variable}
                                    title="Template variables"
                                    subtitle="Fill in the values to personalise each email"
                                />
                                <VariableFields
                                    template={form.selectedTemplate}
                                    values={form.variables}
                                    onChange={handleVariableChange}
                                />
                            </Card>
                        )}

                        {/* Send mode */}
                        <Card>
                            <CardHeader
                                icon={Clock}
                                title="Delivery"
                                subtitle="Send immediately or schedule for later"
                            />

                            {/* Mode toggle */}
                            <div className="flex gap-2 mb-4">
                                {(["now", "schedule"] as SendMode[]).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setForm((p) => ({ ...p, mode: m }))}
                                        className={`flex-1 h-9  text-sm font-medium flex items-center justify-center gap-2 border transition-all
                      ${form.mode === m
                                                ? "bg-gray-600 text-white border-gray-600 shadow-sm"
                                                : "bg-white text-gray-500 border-gray-400 hover:border-gray-300"
                                            }`}
                                    >
                                        {m === "now" ? (
                                            <><Send size={13} />Send now</>
                                        ) : (
                                            <><Calendar size={13} />Schedule</>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Schedule picker */}
                            {form.mode === "schedule" && (
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <Label required>Date</Label>
                                        <Input
                                            type="date"
                                            min={todayStr}
                                            value={form.scheduleDate}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, scheduleDate: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label required>Time</Label>
                                        <Input
                                            type="time"
                                            value={form.scheduleTime}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, scheduleTime: e.target.value }))
                                            }
                                        />
                                    </div>
                                    {form.scheduleDate && form.scheduleTime && (
                                        <div className="col-span-2 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 ">
                                            <Clock size={12} className="text-amber-500 shrink-0" />
                                            <p className="text-xs text-amber-700">
                                                Scheduled for{" "}
                                                <span className="font-medium">
                                                    {new Date(
                                                        `${form.scheduleDate}T${form.scheduleTime}`
                                                    ).toLocaleString("en-IN", {
                                                        dateStyle: "medium",
                                                        timeStyle: "short",
                                                    })}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Validation summary */}
                            {!isValid && form.recipients.length > 0 && (
                                <div className="mt-4 space-y-1.5">
                                    {validationErrors.map((err) => (
                                        <div
                                            key={err}
                                            className="flex items-center gap-2 text-xs text-red-600"
                                        >
                                            <AlertCircle size={11} className="shrink-0" />
                                            {err}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!isValid || submitStatus === "loading"}
                                className="w-full mt-5 h-10 bg-gray-600 text-white text-sm font-semibold 
                  flex items-center justify-center gap-2
                  hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors shadow-sm"
                            >
                                {submitStatus === "loading" ? (
                                    <><Loader2 size={15} className="animate-spin" />Sending...</>
                                ) : form.mode === "schedule" ? (
                                    <><Calendar size={15} />Schedule {form.recipients.length > 0 ? `${form.recipients.length} ` : ""}email{form.recipients.length !== 1 ? "s" : ""}</>
                                ) : (
                                    <><Send size={15} />Send {form.recipients.length > 0 ? `to ${form.recipients.length} recipient${form.recipients.length !== 1 ? "s" : ""}` : "email"}</>
                                )}
                            </button>
                        </Card>
                    </div>

                    {/* Right — Preview (2/5) */}
                    <div className="col-span-1 lg:col-span-2">
                        <div className="lg:sticky lg:top-4">
                            {form.selectedTemplate && showPreview ? (
                                <div className="bg-white border border-gray-400  overflow-hidden h-96 lg:h-[calc(100vh-9rem)]">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Eye size={13} className="text-gray-400" />
                                            <span className="text-xs font-semibold text-gray-700">
                                                Email preview
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            Live — updates as you type
                                        </span>
                                    </div>
                                    <EmailPreviewPanel
                                        template={form.selectedTemplate}
                                        variables={form.variables}
                                        recipient={previewRecipient}
                                    />
                                </div>
                            ) : (
                                /* Empty preview state */
                                <div className="bg-white border border-dashed border-gray-300  h-80 flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                        <Eye size={18} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        Email preview
                                    </p>
                                    <p className="text-xs text-gray-400 max-w-[180px]">
                                        {form.selectedTemplate
                                            ? "Click 'Preview' to see the rendered email"
                                            : "Select a template to preview how it will look"}
                                    </p>
                                </div>
                            )}

                            {/* Right sidebar info */}
                            {form.selectedTemplate && (
                                <div className="mt-4 bg-white border border-gray-400  p-4 space-y-3">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Summary
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-400">Template</span>
                                            <span className="text-xs font-medium text-gray-700">
                                                {form.selectedTemplate.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-400">Recipients</span>
                                            <span className={`text-xs font-medium ${form.recipients.length > 0 ? "text-gray-700" : "text-gray-400"}`}>
                                                {form.recipients.length > 0
                                                    ? `${form.recipients.length} added`
                                                    : "None yet"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-400">Variables</span>
                                            <span className="text-xs font-medium text-gray-700">
                                                {Object.values(form.variables).filter(Boolean).length} /{" "}
                                                {form.selectedTemplate.variables?.length ?? 0} filled
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-400">Delivery</span>
                                            <span className="text-xs font-medium text-gray-700">
                                                {form.mode === "schedule" && form.scheduleDate && form.scheduleTime
                                                    ? new Date(`${form.scheduleDate}T${form.scheduleTime}`).toLocaleString("en-IN", {
                                                        dateStyle: "medium",
                                                        timeStyle: "short",
                                                    })
                                                    : form.mode === "now"
                                                        ? "Immediately"
                                                        : "Not set"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                                            <span className="text-xs text-gray-400">Status</span>
                                            {isValid ? (
                                                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle2 size={11} />
                                                    Ready to send
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                                    <AlertCircle size={11} />
                                                    Incomplete
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}