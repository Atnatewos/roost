// apps/web/src/pages/Register.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth';
import { isValidEmail, isValidEthiopianPhone, validatePassword } from '../utils/validators';
import { appConfig } from '@roost/config';
import useAuth from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

/**
 * ROOST Register Page.
 * Creates new user accounts with email, phone, and password.
 * All validation and feedback uses custom components - no browser defaults.
 */
const Register = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const showToast = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Comprehensive form validation using our custom validators.
   * Validates: required fields, email format, Ethiopian phone format,
   * password strength, and password confirmation match.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!isValidEthiopianPhone(phone)) {
      newErrors.phone = 'Please enter a valid Ethiopian phone number (e.g., 0911XXXXXXX).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Submit registration form.
   * Creates account via API, auto-logs in on success,
   * displays custom toast for all feedback.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await registerUser({
        fullName,
        email,
        phone,
        password,
      });

      if (response.success) {
        updateUser(response.data.user);
        showToast('Account created successfully! Welcome to ROOST.', 'success');
        navigate('/', { replace: true });
      }
    } catch (err) {
      // Custom toast for all errors - never uses browser alert()
      showToast(
        err.message || 'Registration failed. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Visual side */}
      <div className="auth-page__visual">
        <div className="auth-page__visual-content">
          <h1 className="auth-page__visual-title">{appConfig.brand.name}</h1>
          <p className="auth-page__visual-text">
            Join Ethiopia's trusted space rental platform. Find unique stays
            or earn by sharing your space.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-page__form">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2 className="auth-form__title">Create Account</h2>
          <p className="auth-form__subtitle">
            Sign up to start booking or listing spaces.
          </p>

          <Input
            label="Full Name"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            error={errors.fullName}
            icon="👤"
            required
          />

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
            label="Phone Number"
            type="tel"
            placeholder="0911XXXXXXX"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
            }}
            error={errors.phone}
            icon="📱"
            hint="Ethiopian phone number"
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters with uppercase and number"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={errors.password}
            icon="🔒"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            error={errors.confirmPassword}
            icon="🔒"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
          >
            Create Account
          </Button>

          <p className="auth-form__link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;