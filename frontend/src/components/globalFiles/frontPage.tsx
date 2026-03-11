import { useNavigate } from 'react-router-dom'
import { FiFileText, FiShield, FiUpload, FiUsers, FiLogIn, FiStar, FiTrendingUp, FiGlobe } from 'react-icons/fi'
import { useState, useEffect } from 'react'

export default function FrontPage() {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center group">
              <div className="relative">
                <FiFileText className="h-10 w-10 text-blue-600 transform group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DocuMind
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors duration-300 font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center shadow-lg"
              >
                <FiLogIn className="mr-2" />
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200/50 mb-8 shadow-lg">
              <FiStar className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="text-sm text-slate-700 font-medium">Trusted by Professionals</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              DocuMind
            </span>
            <br />
            <span className="text-slate-900">
              Intelligence
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your documents with AI-powered chat and intelligent insights. 
            <span className="text-blue-600 font-semibold"> Ask questions, get answers </span>
            from your documents instantly with advanced natural language processing.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <button
              onClick={() => navigate('/register')}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 text-lg font-semibold shadow-xl hover:shadow-blue-500/25 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <FiTrendingUp className="mr-2" />
                Get Started Free
              </span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-full hover:bg-slate-50 hover:border-slate-400 transform hover:scale-105 transition-all duration-300 text-lg font-semibold backdrop-blur-sm"
            >
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: "10K+", label: "Documents Processed" },
              { number: "99.9%", label: "AI Accuracy Rate" },
              { number: "24/7", label: "Smart Assistant" }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-slate-900">
              Why Choose DocuMind?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Transform your documents with AI-powered intelligence and instant insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiShield className="h-12 w-12" />,
                title: "AI-Powered Chat",
                description: "Ask questions and get instant answers from your documents using advanced natural language processing and machine learning.",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: <FiUsers className="h-12 w-12" />,
                title: "Smart Insights",
                description: "Discover patterns, extract key information, and gain intelligent insights from your document collection automatically.",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: <FiUpload className="h-12 w-12" />,
                title: "Instant Processing",
                description: "Upload any document and start chatting immediately. Our AI processes and understands your content in seconds.",
                color: "from-purple-500 to-pink-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="relative p-8 rounded-2xl bg-white border border-slate-200/50 hover:border-blue-200 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 transform group-hover:rotate-12 transition-transform duration-500`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative py-32 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FiGlobe className="w-20 h-20 mx-auto mb-8 text-blue-200 animate-spin" style={{ animationDuration: '20s' }} />
          <h2 className="text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Documents?
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of professionals who trust DocuMind for intelligent document analysis and AI-powered insights every day.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-12 py-6 bg-white text-blue-600 rounded-full hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 text-xl font-bold shadow-2xl hover:shadow-white/20"
          >
            Start Your Free Trial Today
          </button>
        </div>
      </div>
    </div>
  )
}