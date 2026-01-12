import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ContactForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        domainName: 'ZENCIA.TECH',
        inquiryType: 'Purchase Inquiry',
        message: ''
    });

    const [status, setStatus] = useState({
        loading: false,
        success: false,
        error: ''
    });

    const [turnstileToken, setTurnstileToken] = useState(null);
    const turnstileRef = useRef(null);
    const widgetId = useRef(null);

    useEffect(() => {
        // Initialize Turnstile widget when component mounts
        const initTurnstile = () => {
            if (window.turnstile && turnstileRef.current && !widgetId.current) {
                widgetId.current = window.turnstile.render(turnstileRef.current, {
                    sitekey: process.env.REACT_APP_TURNSTILE_SITEKEY,
                    callback: (token) => {
                        setTurnstileToken(token);
                        // console.log('Turnstile verification successful');
                    },
                    'error-callback': () => {
                        setTurnstileToken(null);
                        setStatus(prev => ({
                            ...prev,
                            error: 'Verification failed. Please refresh and try again.'
                        }));
                    },
                    'expired-callback': () => {
                        setTurnstileToken(null);
                        setStatus(prev => ({
                            ...prev,
                            error: 'Verification expired. Please verify again.'
                        }));
                    }
                });
            }
        };

        // Wait for Turnstile script to load
        if (window.turnstile) {
            initTurnstile();
        } else {
            window.addEventListener('load', initTurnstile);
        }

        return () => {
            // Cleanup on unmount
            if (window.turnstile && widgetId.current) {
                window.turnstile.remove(widgetId.current);
            }
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if Turnstile verification is completed
        if (!turnstileToken) {
            setStatus({
                loading: false,
                success: false,
                error: 'Please complete the verification challenge first.'
            });
            return;
        }

        setStatus({ loading: true, success: false, error: '' });

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const maxRetries = 5;
        const delayBetweenRetries = 1000; // 1 second

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Include Turnstile token in the request
                const dataWithToken = {
                    ...formData,
                    'cf-turnstile-response': turnstileToken
                };

                await axios.post(`${apiUrl}/contact`, dataWithToken, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });

                setStatus({
                    loading: false,
                    success: true,
                    error: ''
                });

                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    domainName: 'ZENCIA.TECH',
                    inquiryType: 'Purchase Inquiry',
                    message: ''
                });

                // Reset Turnstile widget
                if (window.turnstile && widgetId.current) {
                    window.turnstile.reset(widgetId.current);
                }
                setTurnstileToken(null);

                setTimeout(() => {
                    setStatus(prev => ({ ...prev, success: false }));
                    if (onSuccess) {
                        onSuccess();
                    }
                }, 3000);

                return; // ✅ Stop trying if successful
            } catch (error) {
                if (attempt === maxRetries) {
                    console.error('Form submission error after retries:', error);

                    let errorMessage = 'Something went wrong. Please try again.';

                    if (error.response?.data?.error) {
                        errorMessage = error.response.data.error;
                    } else if (error.code === 'ECONNABORTED') {
                        errorMessage = 'Request timeout. Please check your connection and try again.';
                    } else if (!error.response) {
                        errorMessage = 'Unable to connect to server. Please try again later.';
                    }

                    setStatus({
                        loading: false,
                        success: false,
                        error: errorMessage
                    });
                } else {
                    // Wait before retrying
                    await sleep(delayBetweenRetries);
                }
            }
        }
    };


    return (
        <div className="contact-form-container">
            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={status.loading}
                        placeholder="Enter your full name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={status.loading}
                        placeholder="your.email@example.com"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={status.loading}
                        placeholder="+1 (555) 123-4567"
                    />
                </div>

                <div className="form-group">
                    {/* <label htmlFor="domainName">Domain of Interest</label> */}
                    <input
                        type="hidden"
                        id="domainName"
                        name="domainName"
                        value={formData.domainName}
                        onChange={handleChange}
                        disabled={status.loading}
                        placeholder="ZENCIA.TECH"
                        readOnly
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="inquiryType">Inquiry Type</label>
                    <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        disabled={status.loading}
                    >
                        <option value="Purchase Inquiry">Purchase Inquiry</option>
                        <option value="urgent">Urgent</option>
                        <option value="Price Request">Price Request</option>
                        <option value="Lease Options">Lease Options</option>
                        <option value="Partnership">Partnership</option>
                        <option value="General Question">General Question</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={status.loading}
                        rows="4"
                        placeholder="Tell us about your interest in this domain, budget, intended use, or questions..."
                    ></textarea>
                </div>

                {/* Cloudflare Turnstile Widget */}
                <div className="turnstile-container" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '24px 0'
                }}>
                    <div ref={turnstileRef}></div>
                </div>

                <button
                    type="submit"
                    className={`submit-btn ${status.loading ? 'loading' : ''}`}
                    disabled={status.loading || !turnstileToken}
                >
                    {status.loading ? (
                        <>
                            <span className="spinner"></span>
                            Sending...
                        </>
                    ) : (
                        'Send Inquiry'
                    )}
                </button>

                {status.success && (
                    <div className="status-message success">
                        <span className="icon">✅</span>
                        Thank you! Your inquiry has been sent successfully. We'll get back to you within 24 hours.
                    </div>
                )}

                {status.error && (
                    <div className="status-message error">
                        <span className="icon">❌</span>
                        {status.error}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ContactForm;
