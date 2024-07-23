import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SubmitLoanApplication = () => {
    const [durationOfLoan, setDurationOfLoan] = useState('');
    const [purpose, setPurpose] = useState('');
    const [amount, setAmount] = useState('');
    const [idProof, setIdProof] = useState(null);
    const [incomeProof, setIncomeProof] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('access_token');
        const username = localStorage.getItem('username');

        const loanApplicationData = {
            username,
            durationOfLoan,
            purpose,
            amount,
        
        };

        const documentData = new FormData();
        documentData.append('documentType', 'ID Proof');
        documentData.append('documentPath', idProof);
        documentData.append('documentType', 'Income Proof');
        documentData.append('documentPath', incomeProof);

        console.log('Loan Application Data:', loanApplicationData);

        // Check if the files are appended correctly
        for (let pair of documentData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        try {
            const loanResponse = await axios.post(
                'http://127.0.0.1:8000/api/loans/submit-loan/',
                loanApplicationData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Loan Application Response:', loanResponse.data);

            const applicationID = loanResponse.data.applicationID;
            documentData.append('application', applicationID);

            const idProofResponse = await axios.post(
                'http://127.0.0.1:8000/api/loans/document-upload/',
                documentData,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
            );

            console.log('ID Proof Document Response:', idProofResponse.data);

            setMessage('Loan application and documents submitted successfully');
            setTimeout(() => setMessage(''), 3000);
            navigate('/customer-dashboard');
        } catch (error) {
            console.error('Error submitting loan application', error);
            setMessage('Error submitting loan application');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Submit Loan Application</h2>
            {message && <p>{message}</p>}
            <label>
                Duration of Loan (months):
                <input
                    type="number"
                    value={durationOfLoan}
                    onChange={(e) => setDurationOfLoan(e.target.value)}
                    required
                />
            </label>
            <br />
            <label>
                Purpose:
                <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                />
            </label>
            <br />
            <label>
                Amount:
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </label>
            <br />
            <label>
                ID Proof:
                <input
                    type="file"
                    onChange={(e) => setIdProof(e.target.files[0])}
                    required
                />
            </label>
            <br />
            <label>
                Income Proof:
                <input
                    type="file"
                    onChange={(e) => setIncomeProof(e.target.files[0])}
                    required
                />
            </label>
            <br />
            <button type="submit">Submit</button>
        </form>
    );
};

export default SubmitLoanApplication;
