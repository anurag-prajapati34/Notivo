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
        <main>
            <div>
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
        </main>
    );
}