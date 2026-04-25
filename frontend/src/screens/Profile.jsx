import React, { useContext } from 'react';
import { UserContext } from '../context/user.context';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const logout = () => {
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6" 
            style={{ background: 'linear-gradient(160deg,#0f0c29 0%,#1a1a2e 60%,#16213e 100%)' }}>
            
            <div className="w-full max-w-2xl rounded-3xl overflow-hidden relative"
                style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    backdropFilter: 'blur(24px)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.4)'
                }}>
                
                {}
                <div className="h-32 w-full" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}></div>
                
                {}
                <div className="px-8 pb-8 -mt-16">
                    <div className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-6">
                        <div className="w-32 h-32 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl relative z-10"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: '4px solid #1a1a2e' }}>
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        
                        <div className="mt-4 sm:mt-20 flex-grow text-center sm:text-left">
                            <h1 className="text-3xl font-bold text-white mb-1">My Account</h1>
                            <p className="text-indigo-400 text-sm font-medium">Verified Developer</p>
                        </div>

                        <div className="mt-6 sm:mt-20 flex gap-2">
                            <button 
                                onClick={() => navigate('/')}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all bg-white/5 border border-white/10 hover:bg-white/10"
                            >
                                <i className="ri-home-4-line mr-1"></i> Dashboard
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">Email Address</label>
                            <p className="text-white font-medium">{user?.email}</p>
                        </div>
                        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">Account ID</label>
                            <p className="text-white font-medium text-sm truncate">{user?._id || 'UID-839210'}</p>
                        </div>
                        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">Plan</label>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-medium">Free Tier</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">LIFETIME</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">AI Model</label>
                            <p className="text-white font-medium">Gemini 1.5 Flash (Ultra-Fast)</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-xs text-slate-500">
                            Member since April 2024
                        </div>
                        <button 
                            onClick={logout}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-red-400 font-bold text-sm transition-all hover:bg-red-400/10"
                        >
                            <i className="ri-logout-box-line"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Profile;
