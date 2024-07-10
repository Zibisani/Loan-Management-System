import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch('http://127.0.0.1:8000/api/users/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role);  // Store the user's role in local storage
            if (data.role === 'customer') {
                navigate('/dashboard');
            } else if (data.role === 'admin' || data.role === 'loan_officer') {
                navigate('/loan-officer-dashboard');
            }
        } else {
            setError('Login failed! Please check your username and password.');
        }
    };

    const handleRegister = () => {
        navigate('/register'); // Navigate to the registration page
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p></p>
            <a href="#" onClick={handleRegister}>Create new account</a>
        </div>
    );
};

export default Login;
