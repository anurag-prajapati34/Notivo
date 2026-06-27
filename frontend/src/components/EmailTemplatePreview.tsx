
// ─── Preview modal ────────────────────────────────────────────────────────────

import { useEffect } from "react"
import type { EmailTemplate, EmailTemplateVariable } from "../types"
// ─── pages/Template.tsx ──────────────────────────────────────────────────────

import {
    X
} from "lucide-react"


// ─── Variable pill ────────────────────────────────────────────────────────────

const VariablePill = ({ variable }: { variable: EmailTemplateVariable }) => (
    <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono border ${variable.isRequired
            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
            : "bg-gray-50 text-gray-600 border-gray-200"
            }`}
    >
        {`{{${variable.variableName}}}`}
        {variable.isRequired && (
            <span className="text-indigo-400 text-xs leading-none">*</span>
        )}
    </span>
)
export const EmailTemplatePreview = ({
    template,
    onClose,
}: {
    template: EmailTemplate
    onClose: () => void
}) => {
    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="flex flex-col w-[720px] h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden">

                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">{template.name}</h2>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{template.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {template.variables.map((v) => (
                                <VariablePill key={v.variableName} variable={v} />
                            ))}
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Subject bar */}
                <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">Subject</span>
                    <span className="text-xs text-gray-700">{template.subject}</span>
                </div>

                {/* Email preview */}
                <iframe
                    srcDoc={template.html}
                    className="flex-1 w-full"
                    title={`Preview — ${template.name}`}
                    sandbox="allow-same-origin"
                />
            </div>
        </div>
    )
}