import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51PWe7wP0YdHCZmJYXUNZYhu9CSSldvqSD2nYbm45jUKotaocRWOGbMOY2HK9hUCptZuPnZ68RKs9lOB4hBDDGqJ700XXt8yzFL');

const MakePayment = () => {
    const { loanID } = useParams();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setError(error.message);
            return;
        }

        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/loans/make-payment/',
                {
                    loan_id: loanID,
                    amount: amount,
                    payment_method_id: paymentMethod.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                alert('Payment successful!');
                navigate('/dashboard'); // Redirect to dashboard
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setError(JSON.stringify(error.response.data));
            } else {
                setError('Error making payment');
            }
        }
    };

    return (
        <div>
            <h2>Make Payment for Loan ID: {loanID}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handlePayment}>
                <div>
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Card Details:</label>
                    <CardElement />
                </div>
                <button type="submit" disabled={!stripe}>Make Payment</button>
            </form>
        </div>
    );
};

const WrappedMakePayment = () => (
    <Elements stripe={stripePromise}>
        <MakePayment />
    </Elements>
);

export default WrappedMakePayment;
