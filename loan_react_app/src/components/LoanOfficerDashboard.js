import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoanOfficerDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [interestRate, setInterestRate] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplications = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/loans/loan-application-list/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setApplications(response.data);
            } catch (error) {
                console.error('Error fetching loan applications', error);
            }
        };

        fetchApplications();
    }, []);

    const handleApprove = async (applicationID) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/api/loans/loan-application-review/${applicationID}/review/`,
                { status: 'Approved', interest_rate: interestRate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Loan application approved successfully');
            setTimeout(() => setMessage(''), 3000);
            setApplications(applications.filter(app => app.applicationID !== applicationID));
            setSelectedApplication(null);
        } catch (error) {
            console.error('Error approving loan application', error);
            setMessage('Error approving loan application');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeny = async (applicationID) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/api/loans/loan-application-review/${applicationID}/review/`,
                { status: 'Denied' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Loan application denied');
            setTimeout(() => setMessage(''), 3000);
            setApplications(applications.filter(app => app.applicationID !== applicationID));
            setSelectedApplication(null);
        } catch (error) {
            console.error('Error denying loan application', error);
            setMessage('Error denying loan application');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="container">
            <h2>Loan Officer Dashboard</h2>
            {message && <div className="alert alert-success">{message}</div>}
            {applications.length === 0 ? (
                <p>No submitted applications</p>
            ) : (
                <ul className="list-group">
                    {applications.map(app => (
                        <li key={app.applicationID} className="list-group-item">
                            <button className="btn btn-link" onClick={() => setSelectedApplication(app)}>
                                {app.username} - {app.purpose}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {selectedApplication && (
                <div className="selected-application mt-4">
                    <h3>Loan Application Details</h3>
                    <p>Username: {selectedApplication.username}</p>
                    <p>Duration of Loan: {selectedApplication.durationOfLoan} months</p>
                    <p>Purpose: {selectedApplication.purpose}</p>
                    <p>Amount: {selectedApplication.amount}</p>
                    <button className="btn btn-danger" onClick={() => handleDeny(selectedApplication.applicationID)}>Deny</button>
                    <div className="mt-2">
                        <input
                            type="number"
                            className="form-control d-inline"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            placeholder="Interest Rate"
                        />
                        <button className="btn btn-success" onClick={() => handleApprove(selectedApplication.applicationID)}>Approve</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanOfficerDashboard;