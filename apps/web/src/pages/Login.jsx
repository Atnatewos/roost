// apps/web/src/pages/Login.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/auth';
import { isValidEmail } from '../utils/validators';
import { appConfig } from '@roost/config';
import useAuth from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

/**
 * ROOST Login Page.
 * Authenticates users with email and password.
 * Redirects to home on success, shows custom toast on error.
 * Never uses browser-default alerts or form validation.
 */
const Login = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const showToast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate form fields before submission.
   * All validation uses our custom validators - no browser defaults.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission.
   * Sends credentials to API, stores token on success,
   * displays custom toast for all feedback.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await loginUser({ email, password });

      if (response.success) {
        updateUser(response.data.user);
        showToast('Welcome back!', 'success');
        navigate('/', { replace: true });
      }
    } catch (err) {
      // Custom toast for errors - never uses browser alert()
      showToast(
        err.message || 'Login failed. Please check your credentials.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Visual side - branding */}
      <div className="auth-page__visual">
        <div className="auth-page__visual-content">
          <h1 className="auth-page__visual-title">{appConfig.brand.name}</h1>
          <p className="auth-page__visual-text">
            Welcome back! Sign in to manage your bookings and listings.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-page__form">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2 className="auth-form__title">Sign In</h2>
          <p className="auth-form__subtitle">
            Enter your credentials to access your account.
          </p>

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
            icon="📧"
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={errors.password}
            icon="🔒"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
          >
            Sign In
          </Button>

          <p className="auth-form__link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;