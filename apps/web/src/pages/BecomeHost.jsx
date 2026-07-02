// apps/web/src/pages/BecomeHost.jsx

/**
 * @file pages/BecomeHost.jsx
 * @description Page for authenticated guests to upgrade their account to a Host.
 * Explains the benefits of hosting and provides a one-click upgrade mechanism.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { upgradeToHost } from '../services/auth';
import Button from '../components/ui/Button';

const BecomeHost = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && (user.role === 'HOST' || user.role === 'ADMIN')) {
      navigate('/host/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/become-host' } });
    }
  }, [isAuthenticated, navigate]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    setError('');
    try {
      const response = await upgradeToHost();
      if (response.success && response.data.user) {
        updateUser(response.data.user);
        navigate('/host/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upgrade account. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: 'var(--space-8, 2rem) var(--space-4, 1rem)',
  };

  const heroStyle = {
    textAlign: 'center',
    marginBottom: 'var(--space-12, 3rem)',
  };

  const benefitsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 'var(--space-6, 1.5rem)',
    marginBottom: 'var(--space-12, 3rem)',
  };

  const cardStyle = {
    backgroundColor: 'var(--color-white, #ffffff)',
    padding: 'var(--space-6, 1.5rem)',
    borderRadius: 'var(--radius-lg, 0.5rem)',
    boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={heroStyle}>
        <h1 style={{ fontSize: 'var(--font-size-4xl, 2.25rem)', fontWeight: 'var(--font-weight-bold, 700)', marginBottom: 'var(--space-4, 1rem)' }}>
          Become a ROOST Host
        </h1>
        <p style={{ fontSize: 'var(--font-size-lg, 1.125rem)', color: 'var(--color-gray-600, #4b5563)', maxWidth: '600px', margin: '0 auto' }}>
          Turn your extra space into extra income. Join thousands of hosts across Ethiopia earning money by sharing their homes.
        </p>
      </div>

      <div style={benefitsGridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4, 1rem)' }}>💰</div>
          <h3 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', marginBottom: 'var(--space-2, 0.5rem)' }}>Earn Money</h3>
          <p style={{ color: 'var(--color-gray-600, #4b5563)' }}>
            Generate a steady income stream by renting out your property to travelers and locals.
          </p>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4, 1rem)' }}>🛡️</div>
          <h3 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', marginBottom: 'var(--space-2, 0.5rem)' }}>Secure Payments</h3>
          <p style={{ color: 'var(--color-gray-600, #4b5563)' }}>
            We handle the transactions securely via TeleBirr and bank transfers, so you get paid on time.
          </p>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4, 1rem)' }}>🤝</div>
          <h3 style={{ fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 'var(--font-weight-semibold, 600)', marginBottom: 'var(--space-2, 0.5rem)' }}>Easy Management</h3>
          <p style={{ color: 'var(--color-gray-600, #4b5563)' }}>
            Use our intuitive dashboard to manage your listings, bookings, and pricing effortlessly.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', backgroundColor: 'var(--color-gray-50, #f9fafb)', padding: 'var(--space-8, 2rem)', borderRadius: 'var(--radius-lg, 0.5rem)' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl, 1.5rem)', fontWeight: 'var(--font-weight-bold, 700)', marginBottom: 'var(--space-4, 1rem)' }}>
          Ready to get started?
        </h2>
        <p style={{ color: 'var(--color-gray-600, #4b5563)', marginBottom: 'var(--space-6, 1.5rem)' }}>
          Upgrading your account is free and takes less than a second.
        </p>
        
        {error && (
          <div style={{ color: 'var(--color-red-600, #dc2626)', marginBottom: 'var(--space-4, 1rem)' }}>
            {error}
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={handleUpgrade}
          loading={isUpgrading}
          disabled={isUpgrading}
        >
          {isUpgrading ? 'Upgrading Account...' : 'Become a Host Now'}
        </Button>
      </div>
    </div>
  );
};

export default BecomeHost;