// ─── pages/Template.tsx ──────────────────────────────────────────────────────

import {
    Check,
    Code2,
    Copy,
    Eye,
    Hash,
    Variable
} from "lucide-react"
import { useState } from "react"
import { useCopy } from "../hooks"
import type { EmailTemplate, EmailTemplateVariable } from "../types"



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
export const TemplateCard = ({
    template,
    onPreview,
}: {
    template: EmailTemplate
    onPreview: (t: EmailTemplate) => void
}) => {
    const { copiedKey, copy } = useCopy()
    const [showSnippet, setShowSnippet] = useState(false)

    const snippet = `await fetch("https://notivo.app/api/v1/send", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    to: "user@example.com",
    templateId: "${template.slug}",
    data: {
${template.variables.map((v) => `      ${v.variableName}: "value"`).join(",\n")}
    }
  })
})`

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all group flex flex-col">

            {/* Card header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {template.name}
                        </h3>
                        {template.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {template.description}
                            </p>
                        )}
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                    </span>
                </div>

                {/* Template ID — copyable */}
                <div className="flex items-center gap-1.5">
                    <Hash size={10} className="text-gray-400 shrink-0" />
                    <code className="text-xs text-gray-500 font-mono">{template.slug}</code>
                    <button
                        onClick={() => copy(template.slug, `slug-${template.templateId}`)}
                        className="ml-auto opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                        title="Copy template ID"
                    >
                        {copiedKey === `slug-${template.templateId}` ? (
                            <Check size={11} className="text-emerald-500" />
                        ) : (
                            <Copy size={11} />
                        )}
                    </button>
                </div>
            </div>

            {/* Subject */}
            <div className="px-5 py-3 border-b border-gray-50">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Subject</p>
                <p className="text-sm text-gray-700 line-clamp-1" title={template.subject}>
                    {template.subject}
                </p>
            </div>

            {/* Variables */}
            <div className="px-5 py-3 flex-1">
                <div className="flex items-center gap-1.5 mb-2">
                    <Variable size={11} className="text-gray-400" />
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Variables
                        <span className="ml-1 text-gray-300">({template.variables.length})</span>
                    </p>
                </div>

                {template.variables.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {template.variables.map((v) => (
                            <VariablePill key={v.variableName} variable={v} />
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic">No variables</p>
                )}
            </div>

            {/* Code snippet toggle */}
            {showSnippet && (
                <div className="mx-5 mb-3 rounded-lg bg-gray-950 p-3 overflow-x-auto border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Usage snippet</span>
                        <button
                            onClick={() => copy(snippet, `snippet-${template.templateId}`)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            {copiedKey === `snippet-${template.templateId}` ? (
                                <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                            ) : (
                                <><Copy size={11} />Copy</>
                            )}
                        </button>
                    </div>
                    <pre className="text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap break-words">
                        {snippet}
                    </pre>
                </div>
            )}

            {/* Actions */}
            <div className="px-5 pb-5 pt-3 flex gap-2 border-t border-gray-50">
                <button
                    onClick={() => onPreview(template)}
                    className="flex-1 h-8 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Eye size={13} />
                    Preview
                </button>
                <button
                    onClick={() => setShowSnippet((p) => !p)}
                    className={`flex-1 h-8 flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${showSnippet
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                >
                    <Code2 size={13} />
                    {showSnippet ? "Hide snippet" : "Use template"}
                </button>
            </div>
        </div>
    )
}
