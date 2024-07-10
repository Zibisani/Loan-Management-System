import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SubmitLoanApplication = () => {
    const [durationOfLoan, setDurationOfLoan] = useState('');
    const [purpose, setPurpose] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('access_token');
        const username = localStorage.getItem('username'); // Get the username from localStorage
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/loans/submit-loan/', {
              username,
              durationOfLoan,
              purpose,
              amount,
            }, config);
      
            if (response.status === 201) {
                setMessage('Loan application submitted successfully! Redirecting to dashboard...');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000); // Redirect after 2 seconds
            }
          } catch (error) {
            if (error.response && error.response.data) {
              setError(JSON.stringify(error.response.data));
            } else {
              setError('Error submitting loan application');
            }
        }
    };

    return (
        <div>
            <h2>Submit Loan Application</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Duration of Loan (months):</label>
                    <input
                        type="number"
                        value={durationOfLoan}
                        onChange={(e) => setDurationOfLoan(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Purpose:</label>
                    <input
                        type="text"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Submit Application</button>
            </form>
        </div>
    );
};

export default SubmitLoanApplication;
