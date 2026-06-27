// ─── pages/Template.tsx ──────────────────────────────────────────────────────

import {
    LayoutTemplate,
    RefreshCw,
    Search
} from "lucide-react"
import { useEffect, useState } from "react"
import { getEmailTemplatesApi } from "../apis/email.api"
import { EmailTemplatePreview } from "../components/EmailTemplatePreview"
import { TemplateCard } from "../components/TemplateCard"
import type { EmailTemplate } from "../types"




// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ filtered }: { filtered: boolean }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <LayoutTemplate size={20} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">
            {filtered ? "No templates match your search" : "No templates yet"}
        </p>
        <p className="text-xs text-gray-400 max-w-xs">
            {filtered
                ? "Try a different search term."
                : "Default templates are seeded when you create an account."}
        </p>
    </div>
)

// ─── Main page ────────────────────────────────────────────────────────────────

export const Template = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchTemplates = async () => {
        setIsLoading(true)
        try {
            const response = await getEmailTemplatesApi()
            setTemplates(response.data)
        } catch (err) {
            console.error("Failed to fetch templates", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const filtered = templates.filter((t) => {
        const q = searchQuery.toLowerCase()
        return (
            q === "" ||
            t.name.toLowerCase().includes(q) ||
            t.slug.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q)
        )
    })

    return (
        <main >
            <div >

                {/* Page header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-lg font-medium text-gray-900">Templates</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {templates.length} template{templates.length !== 1 ? "s" : ""} available
                        </p>
                    </div>
                    <button
                        onClick={fetchTemplates}
                        className="h-9 px-3 bg-white border border-gray-200 rounded-lg flex items-center gap-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* Search */}
                <div className="relative max-w-xs mb-5">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-8 pr-3 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-100 border border-indigo-200" />
                        <span className="text-xs text-gray-500">Required variable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-100 border border-gray-200" />
                        <span className="text-xs text-gray-500">Optional variable</span>
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw size={18} className="animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.length === 0 ? (
                            <EmptyState filtered={searchQuery !== ""} />
                        ) : (
                            filtered.map((template) => (
                                <TemplateCard
                                    key={template.templateId}
                                    template={template}
                                    onPreview={setSelectedTemplate}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Result count */}
                {!isLoading && filtered.length > 0 && searchQuery && (
                    <p className="text-xs text-gray-400 mt-4">
                        Showing {filtered.length} of {templates.length} templates
                    </p>
                )}
            </div>

            {/* Preview modal */}
            {selectedTemplate && (
                <EmailTemplatePreview
                    template={selectedTemplate}
                    onClose={() => setSelectedTemplate(null)}
                />
            )}
        </main>
    )
}