import type { EmailTemplate } from "../types";

type Props = {
    template: EmailTemplate;
    onClose: () => void;
};

export function EmailTemplatePreview({ template, onClose }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex h-[85vh] w-225 flex-col rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">
                        {template.name}
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded px-3 py-1 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                <iframe
                    srcDoc={template.html}
                    className="h-full w-full"
                    title="Email Preview"
                />
            </div>
        </div>
    );
}