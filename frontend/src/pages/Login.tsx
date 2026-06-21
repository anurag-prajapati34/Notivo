import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
        if (!loginDetails.email || !loginDetails.password) {
            console.log("Enter email and password")
            return
        }
        await login(loginDetails as any);
        setIsLoggedIn(true);
        navigate('/')

    }
    checkAuth();


    useEffect(() => {
        console.log("isLoggedIn", isLoggedIn)
        if (!isLoggedIn) {
            navigate('/login')
        } else {
            navigate('/')
        }
    }, [])

    return (
        <>
            <div className="flex w-full items-center min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                {/* <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="Your Company"
                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Sign in to your account</h2>
                </div> */}

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    onChange={
                                        handleChange
                                    }
                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">
                                    Password
                                </label>
                                {/* <div className="text-sm">
                                    <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">
                                        Forgot password?
                                    </a>
                                </div> */}
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    onChange={handleChange}
                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={handleSubmit}
                                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            >
                                Sign in
                            </button>
                        </div>
                    </div>

                    <p className="mt-10 text-center text-sm/6 text-gray-400">
                        Not a member?{' '}
                        <a href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300">
                            Register now
                        </a>
                    </p>
                </div>
            </div>
        </>
    )
}

export default LoginPage