import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../public/css/login.css"
import logo from "../assets/aclclogo.webp"
import google from "../assets/Google.webp"
import { getIdToken, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth"
import { FirebaseError } from "firebase/app"
// @ts-expect-error this is for authentication
import { auth, googleProvider } from "../firebase/firebase.config.js"
import type { TUserForm } from "../types/types.js"
import { FaEyeSlash, FaEye } from "react-icons/fa6"
import Register from "./Register.js"

export default function Login() {
    const navigateTo = useNavigate()
    const [emailError, setEmailError] = useState<string>('');
    const [emailRequired, setEmailRequired] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [formUser, setFormUser] = useState<TUserForm>({
        email: "",
        password: "",
    })
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
    const [isShowRegisterForm, setIsShowRegisterForm] = useState<boolean>(false)


    // Handle Change Input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormUser((prev) => ({
            ...prev,
            [name]: value
        }));

        if (name === "email") setEmailRequired('')
        if (name === "email") setEmailError('')
        if (name === "password") setPasswordError('')
    }

    // Handle Login User
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true)
        setEmailError('');
        setPasswordError('');
        setEmailRequired('');

        try {
            if (!formUser.email && !formUser.password) {
                setEmailRequired("Email is required");
                setPasswordError("Password is required");
                return;
            }
            if (!formUser.email) {
                setEmailRequired("Email is required");
                return;
            }
            if (!formUser.password) {
                setPasswordError("Password is required");
                return;
            }

            console.log("Trying login with:", formUser.email, "********");

            const userCredential = await signInWithEmailAndPassword(
                auth,
                formUser.email,
                formUser.password
            );

            const user = userCredential.user
            if (user) {
                const token = await getIdToken(user)

                const submitUserCredentials = {
                    token: token,
                    email: user.email,
                    password: formUser.password,
                    uId: user.uid,
                    username: user.displayName || "default"
                };

                await fetch("http://localhost:3000/users", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(submitUserCredentials)
                })

                localStorage.setItem("token", token)
                navigateTo("/dashboard")
            }

        } catch (error: unknown) {
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case 'auth/network-request-failed':
                        alert("Connection failed, please check your network...")
                        break;
                    case 'auth/invalid-credential':
                        setEmailError('Account not found');
                        break;
                    case 'auth/invalid-email':
                        setEmailError('Invalid email format.');
                        break;
                    case 'auth/too-many-requests':
                        alert('Too many login attempts. Please try again later.');
                        break;
                    default:
                        alert(`Login failed: ${error.message}`);
                }
            }

        } finally {
            setIsSubmitting(false)
        }
    };

    // Handle Sign in with Google
    const signInWithGoogle = async () => {
        setIsSubmitting(true)
        try {
            const userCredential = await signInWithPopup(auth, googleProvider)
            const user = userCredential.user

            if (user) {
                const token = await getIdToken(user)

                const submitUserCredentials = {
                    uId: user.uid,
                    token: token,
                    username: user.displayName,
                    email: user.email,
                    password: ""
                }

                await fetch("http://localhost:3000/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(submitUserCredentials)
                })

                localStorage.setItem("token", token)
                navigateTo("/dashboard")
            }
        } catch (error) {
            console.error("Sign-in failed:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="login-container">
            <div className="logo-container">
                <img src={logo} alt="ACLC logo" />
            </div>
            <div className="hero-container">
                <h1>Task Master</h1>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur quo deleniti repellendus dolores exercitationem distinctio!</p>
            </div>
            <div className="login-form-container">
                <h1>Log in to your account</h1>
                <p>Cotinue to Task Master with:</p>
                <div className="social-media-container">
                    <button onClick={signInWithGoogle} className="button-container" type="button" title="Sign in with Google" disabled={isSubmitting}>
                        <img src={google} alt="Google logo" />
                        <label>
                            Sign in with Google
                        </label>
                    </button>
                </div>
                <div className="message-container">
                    <p>Or log in with your Email</p>
                </div>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-input">
                        <label htmlFor="" className="label-email">Email</label>
                        <input
                            type="email"
                            style={{ borderColor: emailError ? "red" : emailRequired ? "red" : "" }}
                            name="email"
                            value={formUser.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoFocus
                        />
                        {emailError && (
                            <p className="error-message" style={
                                { color: 'red', fontSize: '0.9rem', marginTop: '0.3rem', marginLeft: '-20rem' }}>
                                {emailError}
                            </p>
                        )}
                        {emailRequired && (
                            <p className="error-message" style={
                                { color: 'red', fontSize: '0.9rem', marginTop: '0.3rem', marginLeft: '-20rem' }}>
                                {emailRequired}
                            </p>
                        )}
                        <label htmlFor="" className="label-password">Password</label>
                        <input
                            type={isShowPassword ? "text" : "password"}
                            style={{ borderColor: passwordError ? "red" : emailError ? "red" : "" }}
                            name="password"
                            value={formUser.password}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                        {isShowPassword
                            ? <FaEye className="eye-password" onClick={() => setIsShowPassword((prev) => !prev)} />
                            : <FaEyeSlash className="eye-password" onClick={() => setIsShowPassword((prev) => !prev)} />
                        }
                        {passwordError && (
                            <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', marginTop: '1rem', marginLeft: '-18rem' }}>
                                {passwordError}
                            </p>
                        )}
                        <div className="submit-container">
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <div className="loader-container">
                                    <div className="loader"></div>
                                </div> : "Login"}
                            </button>
                        </div>
                    </div>
                </form>
                <div className="create-account-container">
                    <p
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsShowRegisterForm((prev) => !prev)}
                    >
                        Create an account ?
                    </p>
                </div>
            </div>
            {isShowRegisterForm && <Register />}
        </div>
    )
}
