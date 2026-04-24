import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
            
            if (isLogin) {
                login(res.data.user);
            } else {
                setIsLogin(true);
                alert("Registration successful! Please log in.");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-500 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 z-10 fade-in border border-gray-100">
                <div className="text-center mb-8">
                    <i className="fa-solid fa-leaf text-green-600 text-4xl mb-2"></i>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">EcoCity AI</h2>
                    <p className="text-sm text-gray-500 mt-1">{isLogin ? 'Welcome back to the grid.' : 'Join the cleanliness drive.'}</p>
                </div>
                
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <div className="relative">
                            <i className="fa-solid fa-user absolute left-3 top-3.5 text-gray-400"></i>
                            <input type="text" placeholder="Full Name" className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-green-500 focus:bg-white transition" onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                    )}
                    <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
                        <input type="email" placeholder="Email Address" className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-green-500 focus:bg-white transition" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div className="relative">
                        <i className="fa-solid fa-lock absolute left-3 top-3.5 text-gray-400"></i>
                        <input type="password" placeholder="Password" className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-green-500 focus:bg-white transition" onChange={e => setFormData({...formData, password: e.target.value})} required />
                    </div>
                    
                    <button type="submit" className="bg-green-600 text-white font-bold py-3 rounded-lg shadow hover:bg-green-700 transition mt-2">
                        {isLogin ? 'Secure Log In' : 'Register Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6 cursor-pointer hover:text-green-600 font-medium" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Log In"}
                </p>

                <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
                    <strong className="block mb-1"><i className="fa-solid fa-circle-info mr-1"></i> Quick Test Credentials:</strong>
                    <p>Admin: <code className="bg-blue-100 px-1 rounded">admin@ecocity.com</code> / <code className="bg-blue-100 px-1 rounded">admin123</code></p>
                </div>
            </div>
        </div>
    );
};

export default Login;