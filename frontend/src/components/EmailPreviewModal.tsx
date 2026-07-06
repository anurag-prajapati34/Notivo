import type { Email } from "../types";

type Props = {
    email: Email;
    onClose: () => void;
};

export function EmailPreviewModal({
    email,
    onClose,
}: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 bg-opacity-80">
            <div className="flex h-[90vh] w-[95%] md:w-[900px] flex-col  bg-white shadow-xl">
                <div className="flex items-center justify-between border-b p-4">
                    <div>
                        <h2 className="font-semibold">{email.subject}</h2>
                        <p className="text-sm text-gray-500">
                            {email.toEmail}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className=" px-3 py-2 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                <iframe
                    title="Email Preview"
                    srcDoc={email.body ?? ""}
                    className="h-full w-full"
                />
            </div>
        </div>
    );
}