import { useState } from "react";
import { signup } from "../apis/auth.api";
import { useAuthContext } from "../hooks";

export const Signup = () => {
    const { setIsLoggedIn } = useAuthContext();
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
            console.log("Enter all details")
            return
        }
        await signup(signupDetails as any);
        setIsLoggedIn(true);
    }

    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                {/* <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="Your Company"
                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Sign in to your account</h2>
                </div> */}

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
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
                        <label htmlFor="dialCode" className="block text-sm/6 font-medium text-gray-100">
                            Dial Code
                        </label>
                        <div className="mt-2">
                            <input
                                id="dialCode"
                                name="dialCode"
                                type="dialCode"
                                required
                                autoComplete="dialCode"
                                onChange={
                                    handleChange
                                }
                                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="mobile" className="block text-sm/6 font-medium text-gray-100">
                            Mobile
                        </label>
                        <div className="mt-2">
                            <input
                                id="mobile"
                                name="mobile"
                                type="mobile"
                                required
                                autoComplete="mobile"
                                onChange={
                                    handleChange
                                }
                                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="firstName" className="block text-sm/6 font-medium text-gray-100">
                            First name
                        </label>
                        <div className="mt-2">
                            <input
                                id="firstName"
                                name="firstName"
                                type="firstName"
                                required
                                autoComplete="firstName"
                                onChange={
                                    handleChange
                                }
                                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="firstName" className="block text-sm/6 font-medium text-gray-100">
                            Last name
                        </label>
                        <div className="mt-2">
                            <input
                                id="lastName"
                                name="lastName"
                                type="lastName"
                                required
                                autoComplete="lastName"
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
                                onChange={
                                    handleChange
                                }
                                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleSubmit}
                            className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        >
                            SignUp
                        </button>
                    </div>

                    <p className="mt-10 text-center text-sm/6 text-gray-400">
                        Already a member?{' '}
                        <a href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </>
    )
}

export default Signup