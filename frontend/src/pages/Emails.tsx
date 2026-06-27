import { useEffect, useState } from "react";
import type { Email } from "../types";
import { EmailPreviewModal } from "../components/EmailPreviewModal";
import { EmailCard } from "../components/EmailCard";
import { getEmailsListApi } from "../apis/email.api";

export const Emails = () => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] =
        useState<Email | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            const response = await getEmailsListApi()
            setEmails(response.data)
        }
        fetchTemplates()
    }, [])

    return (
        <main>
            <h1 className="mb-8 text-3xl font-bold">
                Sent Emails
            </h1>

            <div className="grid gap-5">
                {emails.map((email, index) => (
                    <EmailCard
                        key={index}
                        email={email}
                        onView={setSelectedEmail}
                    />
                ))}
            </div>

            {selectedEmail && (
                <EmailPreviewModal
                    email={selectedEmail}
                    onClose={() => setSelectedEmail(null)}
                />
            )}
        </main>
    );
}