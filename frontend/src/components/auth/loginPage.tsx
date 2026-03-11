import { FiLogIn, FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { login } from '../../services/auth'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useState, useEffect } from 'react';
import api from '../../services/api';
import axios from 'axios';

interface LoginData {
  email: string
  password: string
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginData>({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function fetchUser() {
    try {
      const res = await api.get("/users/profile");
      return res.data.data; 
    } catch (err) {
      console.error("Failed to fetch user", err);
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form);
      
      localStorage.setItem('token', res.data.accessToken);

      toast.success('Login successful!');

      const fetchedUser = await fetchUser(); 

      if (fetchedUser) {
        localStorage.setItem('user', JSON.stringify(fetchedUser));
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        const { message, errorSources } = data;

        console.error("Status:", status);
        console.error("Message:", message);
        console.error("Sources:", errorSources);
        toast.error(message || 'Login failed');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md">
      <div className="bg-indigo-600 p-6 text-white">
        <div className="flex items-center justify-center space-x-2">
          <FiLogIn className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Welcome Back</h2>
        </div>
        <p className="text-indigo-100 text-center mt-2">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="text-gray-400" />
            </div>
            <input
              name="email"
              placeholder="Email address"
              type="email"
              required
              onChange={handleChange}
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input
              name="password"
              placeholder="Password"
              type="password"
              required
              minLength={6}
              onChange={handleChange}
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            <span className="flex items-center">
              Sign in <FiArrowRight className="ml-2" />
            </span>
          )}
        </button>
      </form>

      <div className="px-6 py-4 bg-gray-50 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  </div>
)
}