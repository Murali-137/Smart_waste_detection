import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from './Context/AuthContext';
import { fetchReports } from '../src/redux/reportSlice';
import CitizenPortal from '../src/pages/CitizenPortal';
import AdminDashboard from '../src/pages/AdminDashBoard';
import Login from './pages/Login';

function App() {
    const { user, logout } = useAuth();
    const dispatch = useDispatch();

    useEffect(() => {
        if (user) {
            dispatch(fetchReports());
        }
    }, [dispatch, user]);

    if (!user) {
        return <Login />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800 relative">
            <nav className="bg-white shadow-md p-4 flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-leaf text-green-600 text-2xl"></i>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">EcoCity AI</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm">
                        <span className="text-gray-500 mr-1">Logged in as:</span>
                        <span className="font-bold text-gray-800">{user.name}</span>
                        <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded uppercase ${user.role === 'admin' ? 'bg-gray-800 text-white' : 'bg-green-100 text-green-700'}`}>
                            {user.role}
                        </span>
                    </div>
                    <button onClick={logout} className="text-sm font-bold text-red-500 hover:text-red-700 transition px-3 py-1 border border-red-200 hover:bg-red-50 rounded">
                        <i className="fa-solid fa-power-off mr-1"></i> Logout
                    </button>
                </div>
            </nav>

            {user.role === 'admin' ? <AdminDashboard /> : <CitizenPortal />}
        </div>
    );
}

export default App;