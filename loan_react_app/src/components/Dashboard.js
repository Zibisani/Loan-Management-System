import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles.css'; 

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [message, setMessage] = useState('');
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        const fetchApplications = async () => {
            const token = localStorage.getItem('access_token');
            const username = localStorage.getItem('username'); // Assuming username is stored in localStorage
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/loans/applications/${username}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setApplications(response.data);
            } catch (error) {
                console.error('Error fetching loan applications', error);
            }
        };

        fetchApplications();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            try {
                const response = await axios.get('http://127.0.0.1:8000/api/users/dashboard/', config);
                setUserData(response.data.user);
            } catch (error) {
                console.error('Error fetching user data', error);
                navigate('/login');  // Redirect to login if fetching data fails
            }
        };

        fetchData();
    }, [navigate]);

    const fetchLoans = async () => {
        const token = localStorage.getItem('access_token');
        const username = localStorage.getItem('username');

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/loans/customer_view_loans/${username}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched loans:', data);  // Debug log
                setLoans(data);
            } else {
                console.error('Failed to fetch loans');
            }
        } catch (error) {
            console.error('Error fetching loans:', error);
        }
    };

    fetchLoans();

    const handleLogout = async () => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
    
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        };
    
        try {
            await axios.post(
                'http://127.0.0.1:8000/api/users/logout/',
                { refresh_token: refreshToken },
                config
            );
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login');
        } catch (error) {
            console.error('Error logging out', error);
            // Optionally handle unauthorized errors (401) here
            if (error.response && error.response.status === 401) {
                // Handle unauthorized access
                console.log('Unauthorized access. Redirecting to login.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
            }
        }
    };

    const handleLoanClick = (loan) => {
        navigate(`/loan/${loan.loanID}`);
    };
  
    const handleLoanApplication = () => {
        navigate('/submit-loan-application');
    };

    const handleApplicationClick = (application) => {
        if (selectedApplication && selectedApplication.applicationID === application.applicationID) {
            setSelectedApplication(null);
        } else {
            setSelectedApplication(application);
        }
    };

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <button className="btn btn-outline-danger logout-button" onClick={handleLogout}>Logout</button>
            <h1 className="mb-4">Welcome to your dashboard, {userData.username}!</h1>
            <div className="card mb-4">
                <div className="card-body">
                    <p><strong>Username:</strong> {userData.username}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Role:</strong> {userData.role}</p>
                </div>
                <div className="card-footer">
                    
                    <button className="btn btn-primary" onClick={handleLoanApplication}>Submit Loan Application</button>
                </div>
            </div>
            <h2>My Applications</h2>
            {message && <p className="text-success">{message}</p>}
            {applications.length === 0 ? (
                <p>No applications found</p>
            ) : (
                <ul className="list-group mb-4">
                    {applications.map(app => (
                        <li key={app.applicationID} className="list-group-item">
                            <button className="btn btn-link" onClick={() => handleApplicationClick(app)}>
                                Application ID: {app.applicationID} - {app.status}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {selectedApplication && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h3 className="card-title">Application Details</h3>
                        <p><strong>Application ID:</strong> {selectedApplication.applicationID}</p>
                        <p><strong>Username:</strong> {selectedApplication.username}</p>
                        <p><strong>Duration of Loan:</strong> {selectedApplication.durationOfLoan} months</p>
                        <p><strong>Purpose:</strong> {selectedApplication.purpose}</p>
                        <p><strong>Status:</strong> {selectedApplication.status}</p>
                        <p><strong>Application Date:</strong> {selectedApplication.applicationDate}</p>
                        <p><strong>Approval Date:</strong> {selectedApplication.approvalDate ? selectedApplication.approvalDate : 'N/A'}</p>
                        <p><strong>Amount:</strong> {selectedApplication.amount}</p>
                    </div>
                </div>
            )}
            <h2>My Loans</h2>
            {loans.length === 0 ? (
                <p>No loans found</p>
            ) : (
                <ul className="list-group">
                    {loans.map(loan => (
                        <li key={loan.loanID} className="list-group-item">
                            <button className="btn btn-link" onClick={() => handleLoanClick(loan)}>
                                Purpose: {loan.purpose}  -  Outstanding Balance: P{loan.outstanding_balance}  -  Loan ID: {loan.loanID}  -  {loan.status}
                            </button>
                            <button onClick={() => navigate(`/make-payment/${loan.loanID}`)}>Make Payment</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dashboard;
