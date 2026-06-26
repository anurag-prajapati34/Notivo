import { useEffect, useState } from "react"
import { getEmailTemplatesApi } from "../apis/email.api"
import { TemplateCard } from "../components/TemplateCard"
import type { EmailTemplate } from "../types"
import { EmailTemplatePreview } from "../components/EmailTemplatePreview"

export const Template = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] =
        useState<EmailTemplate | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            const response = await getEmailTemplatesApi()
            setTemplates(response.data)
        }
        fetchTemplates()
    }, [])

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <TemplateCard
                        key={template.templateId}
                        template={template}
                        onPreview={setSelectedTemplate}
                    />
                ))}
            </div>

            {selectedTemplate && (
                <EmailTemplatePreview
                    template={selectedTemplate}
                    onClose={() => setSelectedTemplate(null)}
                />
            )}
        </>
    );
}