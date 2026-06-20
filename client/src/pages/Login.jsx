import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary">
            Welcome back to
          </h1>
          <h2 className="text-2xl font-bold">
            Incredible<span className="text-primary">India</span>
          </h2>
        </div>
        <div className="card p-6">
          <p className="text-center text-text-secondary">Login Page — Coming Soon</p>
          <div className="mt-4 h-1 mx-auto w-16 rounded-full bg-primary" />
        </div>
        <p className="mt-4 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
