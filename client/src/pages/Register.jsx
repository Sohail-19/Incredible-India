import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/auth';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  
  const getStrengthColor = (index) => {
    if (index >= strength) return 'bg-gray-200';
    if (strength === 1) return 'bg-red-500';
    if (strength === 2) return 'bg-orange-500';
    if (strength === 3) return 'bg-yellow-500';
    if (strength === 4) return 'bg-green-600';
    return 'bg-gray-200';
  };
  
  const getStrengthLabel = () => {
    if (strength === 1) return { text: 'Weak', color: 'text-red-600' };
    if (strength === 2) return { text: 'Fair', color: 'text-orange-600' };
    if (strength === 3) return { text: 'Good', color: 'text-yellow-600' };
    if (strength === 4) return { text: 'Strong', color: 'text-green-600' };
    return { text: '', color: '' };
  };

  const strengthLabel = getStrengthLabel();
  const isFormValid = name && email && password.length >= 8 && agreed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');

    try {
      const data = await registerUser(name, email, password);
      // data contains { token, user }
      login(data.token, data.user);
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setToastMessage('Google sign-in coming soon');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-8">
      {/* Top Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface transition-colors hover:bg-gray-100 shadow-sm border border-border-light"
        >
          <ArrowLeft className="h-5 w-5 text-text-primary" />
        </button>
      </div>

      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center pb-12">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4332] shadow-md">
            <span className="text-xl font-bold text-white tracking-widest">II</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Start discovering India's hidden gems
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-primary">
              Full name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Sohail Akhtar"
              className="w-full rounded-btn border border-border-dark bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-primary">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@example.com"
              className={`w-full rounded-btn border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                error ? 'border-danger' : 'border-border-dark'
              }`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-primary">
              Create password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className={`w-full rounded-btn border bg-white pl-4 pr-12 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                  error ? 'border-danger' : 'border-border-dark'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password Strength Bar */}
            {password.length > 0 && (
              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div 
                      key={index} 
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(index)}`} 
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider w-12 text-right ${strengthLabel.color}`}>
                  {strengthLabel.text}
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-danger">
                <AlertTriangle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>

          <div className="mt-5 flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreed}
              onClick={() => setAgreed(!agreed)}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                agreed ? 'border-primary bg-primary' : 'border-border-dark bg-white hover:border-primary/50'
              }`}
            >
              {agreed && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
            </button>
            <p className="text-xs text-text-secondary leading-relaxed">
              I agree to the{' '}
              <Link to="/terms" className="font-semibold text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-semibold text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="mt-6 w-full rounded-btn bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-70 flex justify-center items-center h-12"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="my-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-border-light" />
          <span className="text-xs text-text-muted uppercase">or</span>
          <div className="h-px flex-1 bg-border-light" />
        </div>

        {/* Google Button Placeholder */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-btn border border-border-dark bg-white py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-gray-50 h-12 shadow-sm"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.71 17.58V20.35H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
            <path d="M12 23C14.97 23 17.46 22.02 19.28 20.35L15.71 17.58C14.73 18.24 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.11H2.17V16.96C3.98 20.55 7.69 23 12 23Z" fill="#34A853"/>
            <path d="M5.84 14.11C5.62 13.45 5.49 12.74 5.49 12C5.49 11.26 5.62 10.55 5.84 9.89V7.04H2.17C1.43 8.52 1 10.2 1 12C1 13.8 1.43 15.48 2.17 16.96L5.84 14.11Z" fill="#FBBC05"/>
            <path d="M12 5.37C13.62 5.37 15.06 5.93 16.2 7.02L19.35 3.87C17.46 2.11 14.97 1 12 1C7.69 1 3.98 3.45 2.17 7.04L5.84 9.89C6.71 7.3 9.14 5.37 12 5.37Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:text-primary-dark">
            Login
          </Link>
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg animate-in fade-in slide-in-from-bottom-5 z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Register;
