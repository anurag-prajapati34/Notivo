import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../apis/auth.api";
import { useAuthContext } from "../hooks";

export const LoginPage = () => {
    const { setIsLoggedIn, isLoggedIn, checkAuth } = useAuthContext();
    const navigate = useNavigate();
    const [loginDetails, setLoginDetails] = useState<{
        email: string | null;
        password: string | null
    }>({
        email: null,
        password: null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'email') {
            setLoginDetails({
                ...loginDetails,
                email: e.target.value
            })
        }

        if (e.target.name === 'password') {
            setLoginDetails({
                ...loginDetails,
                password: e.target.value
            })
        }
    };

    const handleSubmit = async (e: any) => {


        e.preventDefault();
        try {

            if (!loginDetails.email || !loginDetails.password) {
                return
            }
            const result = await login(loginDetails as any);

            // console.log("result---", result)
            if (result.success) {
                setIsLoggedIn(true);
                toast.success('Logged in successfully');
                navigate('/')
            } else {
                toast.error(result.message ?? 'Failed to login');
            }
        } catch (err) {
            toast.error('Failed to login');
        }
    }

    checkAuth();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login')
        } else {
            navigate('/')
        }
    }, [])

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-md shadow-2xl">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-white">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Sign in to manage your account
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
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
                        <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                            Password
                        </label>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="block w-full rounded-lg border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={handleSubmit}
                            className="flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-700"
                        >
                            Sign in
                        </button>
                    </div>
                </div>

                <p className="text-center text-sm text-slate-400">
                    Not a member?{' '}
                    <a href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                        Register now
                    </a>
                </p>
            </div>
        </div>
    )
}

export default LoginPage