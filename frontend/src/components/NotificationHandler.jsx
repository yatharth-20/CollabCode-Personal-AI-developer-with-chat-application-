import React, { useEffect, useContext } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { initializeSocket, recieveMessage } from '../config/socket';
import { UserContext } from '../context/user.context';
import { useNavigate, useLocation } from 'react-router-dom';

const NotificationHandler = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            initializeSocket();

            recieveMessage('project-notification', (data) => {
                const { projectName, message, sender, projectId } = data;

                
                const isCurrentProject = location.pathname === '/project' && location.state?.project?._id === projectId;

                if (!isCurrentProject) {
                    toast((t) => (
                        <div 
                            className="flex flex-col gap-1 cursor-pointer"
                            onClick={() => {
                                toast.dismiss(t.id);
                                navigate('/project', { state: { project: { _id: projectId, name: projectName } } });
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                    {projectName[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900">{projectName}</span>
                                    <span className="text-[10px] text-slate-500">New message from {sender}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-700 truncate max-w-[200px] mt-1 italic">
                                "{message}"
                            </p>
                        </div>
                    ), {
                        duration: 5000,
                        position: 'top-right',
                        style: {
                            background: '#fff',
                            color: '#333',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(99,102,241,0.1)'
                        }
                    });
                }
            });
        }
    }, [user, location.pathname, location.state?.project?._id, navigate]);

    return <Toaster />;
};

export default NotificationHandler;
