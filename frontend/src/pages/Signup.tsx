import { useState } from "react";
import { signup } from "../apis/auth.api";
import { useAuthContext } from "../hooks";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
    const { setIsLoggedIn } = useAuthContext();
    const navigate = useNavigate();
    const [signupDetails, setSignupDetails] = useState<{
        email: string | null;
        password: string | null
        firstName: string | null
        lastName: string | null
        mobile: string | null
        dialCode: string | null
    }>({
        email: null,
        password: null,
        firstName: null,
        lastName: null,
        mobile: null,
        dialCode: null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (['email', 'password', 'firstName', 'lastName', 'mobile', 'dialCode'].includes(name)) {
            setSignupDetails({
                ...signupDetails,
                [name]: value
            })
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!signupDetails.email || !signupDetails.password) {
            return
        }
        await signup(signupDetails as any);
        setIsLoggedIn(true);
        navigate('/login')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-xl space-y-8 rounded-2xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-md shadow-2xl">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-white">
                        Create an account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Join us by filling out your details below
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Grid Wrapper for two column layout on tablet/desktop sizes */}
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    className="block w-full rounded-lg border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-slate-200">
                                First name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    autoComplete="given-name"
                                    onChange={handleChange}
                                    placeholder="John"
                                    className="block w-full rounded-lg border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-slate-200">
                                Last name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    autoComplete="family-name"
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    className="block w-full rounded-lg border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="dialCode" className="block text-sm font-medium text-slate-200">
                                Dial Code
                            </label>
                            <div className="mt-2">
                                <input
                                    id="dialCode"
                                    name="dialCode"
                                    type="text"
                                    required
                                    onChange={handleChange}
                                    placeholder="+1"
                                    className="block w-full rounded-lg border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-slate-200">
                                Mobile Number
                            </label>
                            <div className="mt-2">
                                <input
                                    id="mobile"
                                    name="mobile"
                                    type="tel"
                                    required
                                    autoComplete="tel"
                                    onChange={handleChange}
                                    placeholder="1234567890"
                                    className="block w-full rounded-lg border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="block w-full rounded-lg border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleSubmit}
                            className="flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-700"
                        >
                            Sign up
                        </button>
                    </div>
                </div>

                <p className="text-center text-sm text-slate-400">
                    Already a member?{' '}
                    <a href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                        Login
                    </a>
                </p>
            </div>
        </div>
    )
}

export default Signup