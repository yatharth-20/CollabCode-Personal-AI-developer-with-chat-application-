import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const { user } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen]   = useState(false)
    const [projectName, setProjectName]   = useState('')
    const [projects, setProjects]         = useState([])
    const [loading, setLoading]           = useState(true)

    const navigate = useNavigate()

    function createProject(e) {
        e.preventDefault()
        const trimmedName = projectName.trim()
        if (!trimmedName) return;

        axios.post('/projects/create', { name: trimmedName })
            .then((res) => {
                setIsModalOpen(false)
                setProjectName('')
                setProjects(prev => [res.data, ...prev])
            })
            .catch((error) => console.log(error))
    }

    function deleteProject(id, name) {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

        axios.delete(`/projects/delete/${id}`)
            .then(() => {
                setProjects(prev => prev.filter(p => p._id !== id))
            })
            .catch(err => console.log(err))
    }

    function logout() {
        sessionStorage.removeItem('token');
        navigate('/login');
    }

    useEffect(() => {
        axios.get('/projects/all')
            .then((res) => {
                setProjects(res.data.Projects)
                setLoading(false)
            })
            .catch(err => { console.log(err); setLoading(false) })
    }, [])

    const colors = [
        'linear-gradient(135deg,#6366f1,#8b5cf6)',
        'linear-gradient(135deg,#06b6d4,#6366f1)',
        'linear-gradient(135deg,#f59e0b,#ef4444)',
        'linear-gradient(135deg,#10b981,#06b6d4)',
        'linear-gradient(135deg,#ec4899,#8b5cf6)',
        'linear-gradient(135deg,#f97316,#f59e0b)',
    ]

    return (
        <main className="min-h-screen" style={{ background: 'linear-gradient(160deg,#0f0c29 0%,#1a1a2e 60%,#16213e 100%)' }}>

            {}
            <nav className="flex items-center justify-between px-8 py-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                        <i className="ri-code-s-slash-line text-white text-lg"></i>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">CollabCode <span className="text-indigo-400 font-normal text-xs ml-1 hidden sm:inline">: Personal AI developer with chat application</span></span>
                </div>

                <div className="flex items-center gap-3">
                    <div 
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm text-slate-300 max-w-40 truncate">{user?.email}</span>
                    </div>

                    <button
                        onClick={logout}
                        title="Logout"
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                    >
                        <i className="ri-logout-box-line text-lg"></i>
                    </button>
                </div>
            </nav>

            {}
            <div className="max-w-6xl mx-auto px-8 py-10">

                {}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">My Projects</h1>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {projects.length} project{projects.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200"
                        style={{
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <i className="ri-add-line text-lg"></i>
                        New Project
                    </button>
                </div>

                {}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <i className="ri-loader-4-line text-3xl text-indigo-400 animate-spin"></i>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <i className="ri-folder-line text-3xl text-indigo-400"></i>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
                        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Create your first project to get started
                        </p>
                        <button onClick={() => setIsModalOpen(true)}
                            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {projects.map((proj, idx) => (
                            <div
                                key={proj._id}
                                onClick={() => navigate('/project', { state: { project: proj } })}
                                className="group cursor-pointer rounded-2xl p-5 transition-all duration-200"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                                    e.currentTarget.style.transform = 'translateY(-3px)'
                                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: colors[idx % colors.length] }}>
                                        <i className="ri-folder-code-line text-white text-lg"></i>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteProject(proj._id, proj.name);
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <i className="ri-delete-bin-line text-sm"></i>
                                    </button>
                                </div>

                                <h2 className="font-bold text-white text-base mb-3 truncate group-hover:text-indigo-300 transition-colors">
                                    {proj.name}
                                </h2>

                                <div className="flex items-center gap-1.5 text-xs"
                                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    <i className="ri-team-line"></i>
                                    <span>{proj.users?.length || 0} collaborator{proj.users?.length !== 1 ? 's' : ''}</span>
                                </div>

                                <div className="mt-4 pt-4 flex items-center justify-between"
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                        style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                                        Active
                                    </span>
                                    <i className="ri-arrow-right-line text-slate-600 group-hover:text-indigo-400 transition-colors"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
                    <div className="w-full max-w-sm mx-4 rounded-2xl p-6"
                        style={{
                            background: 'rgba(30,27,75,0.95)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
                        }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">New Project</h2>
                            <button onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <form onSubmit={createProject}>
                            <div className="mb-5">
                                <label className="block text-xs font-medium mb-2 uppercase tracking-wider"
                                    style={{ color: 'rgba(255,255,255,0.5)' }}>Project Name</label>
                                <div className="relative">
                                    <i className="ri-folder-line absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400"></i>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="my-awesome-project"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.07)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                        onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                                        onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
                                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}>
                                    <i className="ri-add-line mr-1"></i> Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home
