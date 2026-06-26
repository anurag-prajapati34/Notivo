import type { EmailTemplate } from "../types";

type Props = {
    template: EmailTemplate;
    onPreview?: (template: EmailTemplate) => void;
};

export const TemplateCard = ({ template, onPreview }: Props) => {
    return (
        <div
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {template.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {template.slug}
                    </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Active
                </span>
            </div>

            <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">
                    Subject
                </p>

                <p className="mt-1 text-sm text-gray-600">
                    {template.subject}
                </p>
            </div>

            {template.description && (
                <p className="mt-4 text-sm text-gray-500">
                    {template.description}
                </p>
            )}

            <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-gray-700">
                    Variables
                </p>

                <div className="flex flex-wrap gap-2">
                    {template.variables.map(variable => (
                        <span
                            key={variable.variableName}
                            className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                        >
                            {`{{${variable.variableName}}}`}
                        </span>
                    ))}
                </div>
            </div>

            <button
                onClick={() => onPreview?.(template)}
                className="mt-6 w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white transition hover:bg-black"
            >
                Preview Template
            </button>
        </div>
    );
};