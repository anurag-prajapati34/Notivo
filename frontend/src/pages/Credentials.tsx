import { useState } from "react";
import { getApiKeyApi, setEmailCredsApi } from "../apis/creds.api";
import { Button } from "../components/button";
import type { EmailCreds } from "../types";

export const Credentials = () => {
    const [emailCreds, setEmailCreds] = useState<EmailCreds>({
        email: "",
        passKey: ""
    });

    const [apiKey, setApiKey] = useState<string>("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEmailCreds({
            ...emailCreds,
            [name]: value
        });
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        // Handle form submission here
        if (emailCreds.email.trim().length > 0 && emailCreds.passKey.trim().length > 0) {
            console.log(emailCreds);
            await setEmailCredsApi(emailCreds);
        }
    }

    const handleGetApiKey = async (e: any) => {
        e.preventDefault();

        const result = await getApiKeyApi();
        console.log("api key result---", result)
        if (result && result.data && result.data.apiKey) {
            setApiKey(result.data.apiKey);
        }
    }
    return (
        <main>
            <h1 className="text-lg font-bold mb-1">Credentials Page</h1>
            <p className="text-lg font-semibold mb-4">Manage your email credentials here.</p>
            {/* Add your email credentials management logic here */}
            <div className="flex flex-col gap-2 items-start">
                <div>
                    <label htmlFor="email">Email:</label>
                    <input onChange={handleInputChange} name="email" type="email" placeholder="Email" />
                </div>
                <div>
                    <label htmlFor="passKey">Password:</label>
                    <input onChange={handleInputChange} name="passKey" type="password" placeholder="Password" />
                </div>
                <Button text="Submit" disabled={false} onClick={handleSubmit} />
            </div>

            <br />
            <br />
            <hr />

            <h1 className="text-lg font-bold mb-1">API Key</h1>
            <p className="text-lg font-semibold mb-4">Manage your API keys here.</p>
            <div>
                <label htmlFor="apiKey">API Key:</label>
                <input className="text-red-400" type="text" name="apiKey " id="apiKey" placeholder="API Key" value={apiKey} readOnly />
            </div>
            <Button text="Generate API Key" disabled={false} onClick={handleGetApiKey} />


        </main>
    )
};