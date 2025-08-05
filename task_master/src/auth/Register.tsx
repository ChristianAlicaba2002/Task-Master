import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
// @ts-expect-error this is for authentication
import { auth } from '../firebase/firebase.config';
import { FaPlus } from "react-icons/fa6";
import '../../public/css/register.css';
export default function Register() {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isShowRegisterForm, setIsShowRegisterForm] = useState<boolean>(true);
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [firstNameError, setFirstNameError] = useState<string>('');
    const [lastNameError, setLastNameError] = useState<string>('');
    const [usernameError, setUsernameError] = useState<string>('');
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
    });

    // Handle Change Input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value.trim() }));

        if (name === "first_name") setFirstNameError('');
        if (name === "last_name") setLastNameError('');
        if (name === "username") setUsernameError('');
        if (name === "email") setEmailError('');
        if (name === "password") setPasswordError('');
    };

    // Handle Register User
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setEmailError('');
        setPasswordError('');
        setFirstNameError('');
        setLastNameError('');
        setUsernameError('');
        try {
            if (!form.first_name || !form.last_name || !form.username || !form.email || !form.password) {
                setFirstNameError('Firstname is required')
                setLastNameError('Lastname is required')
                setUsernameError('Username is required')
                setEmailError('Email is required')
                setPasswordError('Password is required')
                return;
            }
            const newUser = await createUserWithEmailAndPassword(
                auth,
                form.email,
                form.password
            );
            const user = newUser.user

            if (user) {
                const uid = user.uid;

                const submitUserCredentials = {
                    ...form,
                    uId: uid,
                };

                const response = await fetch("http://localhost:3000/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(submitUserCredentials)
                });

                const data = await response.json();
                if (data) console.log(data);

                alert('Registration successful!');
                window.location.reload();
            }

        } catch (error: unknown) {
            if (error instanceof FirebaseError) {
                console.error('Firebase error:', error.code);

                switch (error.code) {
                    case 'auth/network-request-failed':
                        alert('Connection failed, please check your network...')
                        break;
                    case 'auth/email-already-in-use':
                        setEmailError('This email is already used.');
                        break;
                    case 'auth/invalid-email':
                        setEmailError('Email format is invalid.');
                        break;
                    case 'auth/weak-password':
                        setPasswordError('Password must be at least 6 characters.');
                        break;
                    case 'auth/too-many-requests':
                        setEmailError('Too many attempts. Try again later.');
                        break;
                    default:
                        alert(`Registration failed: ${error.message}`);
                }
            } else {
                console.error('Unknown error:', error);
                alert('An unexpected error occurred.');
            }
        }
        finally {
            setIsSubmitting(false)
        }
    };

    return (
        <>
            {isShowRegisterForm && (
                <div className="register-container">
                    <form onSubmit={handleRegister} className="register-form">
                        <div className="close-container">
                            <FaPlus onClick={() => setIsShowRegisterForm((prev) => !prev)} className='close' />
                        </div>
                        <h2>Create Account</h2>
                        <p>Create your Task Master account to start organizing your work efficiently. Manage tasks, set priorities, and track your progress across projects all in one place.</p>

                        <input
                            type="text"
                            style={{ borderColor: firstNameError ? "red" : "" }}
                            name="first_name"
                            placeholder="First Name"
                            value={form.first_name}
                            onChange={handleChange}
                            disabled={isSubmitting}


                        />
                        {firstNameError && (
                            <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', marginTop: '-0.6rem', marginLeft: '-21rem', marginBottom: '0.75rem' }}>
                                {firstNameError}
                            </p>
                        )}
                        <input
                            type="text"
                            style={{ borderColor: lastNameError ? "red" : "" }}
                            name="last_name"
                            placeholder="Last Name"
                            value={form.last_name}
                            onChange={handleChange}
                            disabled={isSubmitting}


                        />
                        {lastNameError && (
                            <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', marginTop: '-0.6rem', marginLeft: '-21rem', marginBottom: '0.75rem' }}>
                                {lastNameError}
                            </p>
                        )}
                        <input
                            type="text"
                            style={{ borderColor: usernameError ? "red" : "" }}
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            disabled={isSubmitting}


                        />
                        {usernameError && (
                            <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', marginTop: '-0.6rem', marginLeft: '-21rem', marginBottom: '0.75rem' }}>
                                {usernameError}
                            </p>
                        )}
                        <input
                            type="email"
                            style={{ borderColor: emailError ? "red" : "" }}
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={isSubmitting}

                        />
                        {emailError && (
                            <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', width: '20rem', marginTop: '-0.6rem', marginLeft: '-6.2rem', marginBottom: '0.75rem' }}>
                                {emailError}
                            </p>
                        )}
                        <input
                            type="password"
                            style={{ borderColor: passwordError ? "red" : "" }}
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            disabled={isSubmitting}

                        />
                        {passwordError && (
                            <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', marginTop: '-0.6rem', marginLeft: '-21rem', marginBottom: '0.75rem' }}>
                                {passwordError}
                            </p>
                        )}

                        <button className='register-btn' type="submit">
                            {isSubmitting ? <div className="loader-container">
                                <div className="loader"></div>
                            </div> : "Register"}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
