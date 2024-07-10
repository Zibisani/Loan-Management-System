import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const LoanDetails = () => {
    const { loanID } = useParams();
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLoan = async () => {
            const token = localStorage.getItem('access_token');

            console.log('Access Token:', token);
            console.log('Loan ID:', loanID);

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/loans/loan/${loanID}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched loan details:', data);
                    setLoan(data);
                } else {
                    console.error('Failed to fetch loan details:', response.status, response.statusText);
                    setError('Failed to fetch loan details');
                }
            } catch (error) {
                console.error('Error fetching loan details:', error);
                setError('Error fetching loan details');
            } finally {
                setLoading(false);
            }
        };

        fetchLoan();
    }, [loanID]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!loan) {
        return <p>No loan details available</p>;
    }

    return (
        <div>
            <h2>Loan Details</h2>
            <p>Loan ID: {loan.loanID}</p>
            <p>Username: {loan.username}</p>
            <p>Duration of Loan: {loan.durationOfLoan} months</p>
            <p>Purpose: {loan.purpose}</p>
            <p>Status: {loan.status}</p>
            <p>Application Date: {loan.applicationDate}</p>
            <p>Approval Date: {loan.approvalDate ? loan.approvalDate : 'N/A'}</p>
            <p>Amount: {loan.amount}</p>
        </div>
    );
};

export default LoanDetails;
