import { useState, useEffect } from 'react'
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { register, login } from '../../services/auth'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import axios from 'axios'

interface FormData {
  name: string
  email: string
  password: string
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', password: '' })
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

  const fetchUser = async () => {
    try {
      const res = await api.get("/users/profile");
      return res.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        const { message, errorSources } = data;

        console.error("Status:", status);
        console.error("Message:", message);
        console.error("Sources:", errorSources);
        toast.error(message || 'Failed to fetch user');
      }
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    
    try {
      await register(form)
      toast.success('Registration successful!')
      
      const loginRes = await login({
        email: form.email,
        password: form.password
      })
      
      localStorage.setItem('token', loginRes.data.accessToken);
      const fetchedUser = await fetchUser();
      
      if (fetchedUser) {
        localStorage.setItem('user', JSON.stringify(fetchedUser));
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        const { message, errorSources } = data;

        console.error("Status:", status);
        console.error("Message:", message);
        console.error("Sources:", errorSources);
        toast.error(message || 'Registration failed');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md">
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center justify-center space-x-2">
            <FiUser className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Create Account</h2>
          </div>
          <p className="text-indigo-100 text-center mt-2">
            Join our community of travelers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                name="name"
                placeholder="Full name"
                required
                onChange={handleChange}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

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
                placeholder="Password (min 6 characters)"
                type="password"
                required
                minLength={6}
                onChange={handleChange}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
            </label>
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
                Creating account...
              </span>
            ) : (
              <span className="flex items-center">
                Sign up <FiArrowRight className="ml-2" />
              </span>
            )}
          </button>
        </form>

        <div className="px-6 py-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}