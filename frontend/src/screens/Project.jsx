import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, recieveMessage, sendMessage, joinProject } from '../config/socket'
import { UserContext } from '../context/user.context'
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { getWebContainer } from '../config/webContainer';


window.hljs = hljs;

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)

      
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}

const Project = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(location.state?.project || null);
  const [message, setMessage] = useState('');
  const { user } = useContext(UserContext);
  const messageBox = useRef();

  const [users, setUsers] = useState([]);

  
  const [messages, setMessages] = useState([]) 
  const [fileTree, setFileTree] = useState({})

  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])

  const [webContainer, setwebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)

  const [runProcess, setRunProcess] = useState(null)

  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const loadingMessages = [
    "Thinking...",
    "Architecting...",
    "Writing code...",
    "Polishing...",
    "Almost there..."
  ]
  const aiMessageBoxRef = useRef(null)
  
  
  useEffect(() => {
    let interval;
    if (aiLoading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [aiLoading]);

  const handleUserClick = (id) => {
    setSelectedUserId(prevSelectedUserId => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });


  }


  function addCollaborators() {

    axios.put('/projects/add-user', {
      projectId: project?._id || location.state?.project?._id,
      users: Array.from(selectedUserId)
    }).then(res => {
      console.log(res.data);
      setIsModalOpen(false);
      setSelectedUserId(new Set());

      
      const projectId = project?._id || location.state?.project?._id;
      axios.get(`/projects/get-project/${projectId}`).then(res => {
        setProject(res.data.project);
      }).catch(err => console.log(err));

    }).catch(err => {
      console.log(err);
    })

  }

  const send = () => {

    sendMessage('project-message', {
      message,
      sender: user
    })

    
    setMessages(prevMessages => [...prevMessages, { sender: user, message }]) 

    setMessage("");

  }

  
  const sendAiMessage = () => {
    if (!aiInput.trim() || aiLoading) return;

    const userMsg = aiInput.trim();
    const updatedHistory = [...aiMessages, { role: 'user', text: userMsg }];
    setAiMessages(updatedHistory);
    setAiInput('');
    setAiLoading(true);

    
    sendMessage('project-message', {
      message: `@ai ${userMsg}`,
      sender: user,
      history: updatedHistory.slice(-10)   
    });
  }

  
  useEffect(() => {
    if (aiMessageBoxRef.current) {
      aiMessageBoxRef.current.scrollTop = aiMessageBoxRef.current.scrollHeight;
    }
  }, [aiMessages]);

  function createNewFile() {
    if (!newFileName.trim()) return;
    const fname = newFileName.trim();
    const updatedTree = {
      ...fileTree,
      [fname]: { file: { contents: '' } }
    };
    setFileTree(updatedTree);
    saveFileTree(updatedTree);
    setCurrentFile(fname);
    setOpenFiles(prev => [...new Set([...prev, fname])]);
    setNewFileName('');
    setIsCreatingFile(false);
  }

  function deleteFile(fileName) {
    const updatedTree = { ...fileTree };
    delete updatedTree[fileName];
    setFileTree(updatedTree);
    saveFileTree(updatedTree);
    
    setOpenFiles(prev => prev.filter(f => f !== fileName));
    if (currentFile === fileName) {
      const remaining = Object.keys(updatedTree);
      setCurrentFile(remaining.length > 0 ? remaining[0] : null);
    }
  }

  function deleteProject() {
    if (!window.confirm(`Are you sure you want to delete "${project?.name}"? All files and chat history will be lost forever.`)) return;

    axios.delete(`/projects/delete/${project?._id}`)
      .then(() => {
        navigate('/');
      })
      .catch(err => console.log(err));
  }

  function logout() {
    sessionStorage.removeItem('token');
    navigate('/login');
  }

  function WriteAiMessage(message) {

    let messageObject;
    try {
      messageObject = typeof message === 'string' ? JSON.parse(message) : message;
    } catch (_e) {
      
      messageObject = { text: String(message) };
    }

    return (
      <div
        className='overflow-auto bg-slate-950 text-white rounded-sm p-2'
      >
        <Markdown
          children={messageObject.text || ''}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>)
  }


  
  useEffect(() => {
    const projectId = location.state?.project?._id;
    if (!projectId) return;

    initializeSocket();
    joinProject(projectId);

    
    axios.get(`/projects/get-project/${projectId}`).then(res => {
      console.log(res.data.project);

      setProject(res.data.project);
      const ft = res.data.project.fileTree || {};
      setFileTree(ft);
      setMessages(res.data.project.messages || []);
      setAiMessages(res.data.project.aiMessages || []);

      
      const files = Object.keys(ft);
      if (files.length > 0 && !currentFile) {
        setCurrentFile(files[0]);
        setOpenFiles([files[0]]);
      }

    }).catch(err => {
      console.log(err);
    })

    
    axios.get('/users/all').then(res => {
      setUsers(res.data.users);
    }).catch(err => {
      console.log(err);
    })

    
    recieveMessage('ai-stream-chunk', ({ text }) => {
      setAiLoading(false);
      setAiMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.isStreaming) {
          const updated = [...prev];
          updated[updated.length - 1] = { ...last, text: text.replace(/\\n/g, '\n').replace(/\\"/g, '"') };
          return updated;
        } else {
          return [...prev, { role: 'ai', text: text.replace(/\\n/g, '\n').replace(/\\"/g, '"'), isStreaming: true }];
        }
      });
    });

    recieveMessage('project-message', data => {

      let message = data.message;

      
      if (data.sender?._id === 'ai') {
        
        try {
          const parsed = JSON.parse(data.message);
          message = parsed;

          
          setAiMessages(prev => {
            const filtered = prev.filter(m => !m.isStreaming);
            return [...filtered, { role: 'ai', text: parsed.text || '' }];
          });
          setAiLoading(false);

          if (parsed.fileTree) {
            
            setFileTree(prevTree => {
              const merged = { ...prevTree, ...parsed.fileTree };
              
              axios.put('/projects/update-file-tree', {
                projectId: project?._id || location.state?.project?._id,
                fileTree: merged
              }).catch(err => console.log('Error saving AI file tree:', err));
              return merged;
            });

            
            const aiFiles = Object.keys(parsed.fileTree);
            if (aiFiles.length > 0) {
              const firstFile = aiFiles[0];
              setCurrentFile(firstFile);
              setOpenFiles(prev => [...new Set([...prev, firstFile])]);
            }

            
            if (webContainer) {
              webContainer.mount(parsed.fileTree).catch(err => {
                console.log('Error mounting file tree:', err);
              });
            }
          }
        } catch (_e) {
          
          setAiMessages(prev => {
            const filtered = prev.filter(m => !m.isStreaming);
            return [...filtered, { role: 'ai', text: String(data.message) }];
          });
          setAiLoading(false);
        }

        
        return;
      }

      
      console.log(message);
      setMessages(prevMessages => [...prevMessages, data]);

    });

    
    recieveMessage('file-tree-update', ({ fileTree: remoteTree }) => {
      if (!remoteTree) return;
      setFileTree(prev => {
        const merged = { ...prev, ...remoteTree };
        return merged;
      });
    });

  }, [location.state?.project?._id])

  
  useEffect(() => {
    if (!webContainer) {
      getWebContainer().then(container => {
        setwebContainer(container);
      }).catch(err => {
        console.log(err);
      })
    }
  }, [])

  function saveFileTree(ft) {
    const projectId = project?._id || location.state?.project?._id;
    axios.put('/projects/update-file-tree', {
      projectId,
      fileTree: ft
    }).then(() => {
      
      sendMessage('file-tree-update', { fileTree: ft });
    }).catch(err => {
      console.log('Error saving file tree:', err);
    });
  }


  function ScrollToBottom() {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }

  
  function getLanguage(filename) {
    if (!filename) return 'javascript';
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
      js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
      py: 'python', json: 'json', html: 'html', css: 'css', scss: 'scss',
      md: 'markdown', sh: 'bash', yml: 'yaml', yaml: 'yaml',
      java: 'java', c: 'c', cpp: 'cpp', cs: 'csharp', go: 'go',
      rs: 'rust', php: 'php', rb: 'ruby', sql: 'sql', xml: 'xml',
    };
    return map[ext] || 'plaintext';
  }

  
  if (!project && !location.state?.project) {
    return (
      <main className='h-screen w-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-lg text-gray-600 mb-4'>No project selected.</p>
          <button
            onClick={() => navigate('/')}
            className='px-4 py-2 bg-blue-600 text-white rounded-md'
          >Go Home</button>
        </div>
      </main>
    )
  }

  return (
    <main className='h-screen w-screen flex' style={{ background: '#0f0c29', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {}
      <section className="left relative flex flex-col h-screen min-w-96"
        style={{ background: 'rgba(15,12,41,0.95)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {}
        <header className="flex justify-between items-center px-4 py-3 absolute top-0 w-full z-10"
          style={{ background: 'rgba(15,12,41,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => navigate('/')}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all'
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <i className='ri-home-4-line'></i>
              Home
            </button>

            {}
            <div className='flex items-center gap-2 px-3 py-1.5 rounded-xl'
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <i className='ri-folder-code-line text-indigo-400 text-sm'></i>
              <span className='text-white text-xs font-semibold truncate max-w-28'>{project?.name || 'Project'}</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all'
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <i className='ri-user-add-line'></i>
              Add
            </button>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className='w-8 h-8 rounded-xl flex items-center justify-center transition-all'
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              title='Collaborators'
            >
              <i className='ri-team-line text-sm'></i>
            </button>

            <button
              onClick={logout}
              className='w-8 h-8 rounded-xl flex items-center justify-center transition-all'
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fca5a5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
              title='Logout'
            >
              <i className='ri-logout-box-line text-sm'></i>
            </button>
          </div>

        </header>

        {}
        <div className="conversation-area flex-grow pt-16 pb-16 flex flex-col h-full relative">
          <div ref={messageBox}
            className="message-box px-3 py-3 flex-grow flex flex-col gap-2 overflow-auto max-h-full scrollbar-hide">

            {messages.length === 0 && (
              <div className='flex flex-col items-center justify-center flex-grow text-center py-10'>
                <i className='ri-chat-3-line text-4xl mb-3' style={{ color: 'rgba(255,255,255,0.15)' }}></i>
                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.25)' }}>No messages yet. Say hi!</p>
              </div>
            )}

            {messages.map((msg, index) => {
              const isMe = msg.sender?._id?.toString() === user?._id?.toString();
              const senderEmail = msg.sender?.email || 'System';
              return (
                <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                  <span className='text-xs mb-1 px-1' style={{ color: 'rgba(255,255,255,0.35)' }}>{senderEmail}</span>
                  <div className='px-3 py-2 rounded-2xl text-sm'
                    style={{
                      background: isMe
                        ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                        : 'rgba(255,255,255,0.07)',
                      color: isMe ? '#fff' : 'rgba(255,255,255,0.85)',
                      border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      borderBottomRightRadius: isMe ? 4 : undefined,
                      borderBottomLeftRadius: isMe ? undefined : 4,
                    }}>
                    {msg.message}
                  </div>
                </div>
              );
            })}

          </div>

          {}
          <div className='absolute bottom-0 left-0 right-0 px-3 py-3'
            style={{ background: 'rgba(15,12,41,0.9)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className='flex items-center gap-2 rounded-2xl px-3 py-1'
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>

              <button
                onClick={() => setIsAiPanelOpen(true)}
                className='flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0'
                style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
                title='Open AI Assistant'
              >
                <i className='ri-robot-2-line'></i>
                <span>@ai</span>
              </button>

              <input
                value={message}
                onChange={(e) => {
                  const val = e.target.value;
                  setMessage(val);
                  if (val.trim().toLowerCase() === '@ai') {
                    setIsAiPanelOpen(true);
                    setMessage('');
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && message.trim()) send(); }}
                className='flex-grow bg-transparent text-white text-sm outline-none py-2 placeholder-slate-600'
                type='text' placeholder='Message team...' />

              <button
                onClick={send}
                disabled={!message.trim()}
                className='w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30'
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              >
                <i className='ri-send-plane-fill text-white text-sm'></i>
              </button>
            </div>
          </div>
        </div>

        {}
        <div className={`absolute inset-0 z-20 flex flex-col transition-all duration-300 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: 'rgba(15,12,41,0.98)', backdropFilter: 'blur(16px)' }}>

          <header className='flex justify-between items-center px-4 py-3'
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className='flex items-center gap-2'>
              <i className='ri-team-line text-indigo-400'></i>
              <h1 className='font-semibold text-white text-sm'>Collaborators</h1>
              <span className='px-2 py-0.5 rounded-full text-xs'
                style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                {project?.users?.length || 0}
              </span>
            </div>
            <button
              onClick={() => setIsSidePanelOpen(false)}
              className='w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors'
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <i className='ri-close-line'></i>
            </button>
          </header>

          <div className="users flex flex-col gap-1 p-3 overflow-auto flex-grow">
            {project && project.users && project.users.map((collab, idx) => {
              const id    = collab?._id || collab;
              const email = collab?.email || String(id);
              return (
                <div key={id || idx}
                  className='flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all'
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className='w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0'
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {email[0]?.toUpperCase()}
                  </div>
                  <div className='overflow-hidden'>
                    <p className='text-white text-sm font-medium truncate'>{email}</p>
                    <p className='text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>Member</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className='p-4 mt-auto' style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={deleteProject}
              className='w-full py-2.5 rounded-xl text-red-400 font-semibold text-sm transition-all flex items-center justify-center gap-2'
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f17171'; }}
            >
              <i className='ri-delete-bin-line'></i>
              Delete Project
            </button>
          </div>
        </div>

        {}
        <div className={`absolute inset-0 z-50 flex flex-col transition-all duration-500 ease-in-out ${isAiPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ 
            background: '#0f172a', 
            boxShadow: '20px 0 50px rgba(0,0,0,0.5)',
            borderRight: '1px solid rgba(99,102,241,0.2)' 
          }}
        >
          {}
          <header className='flex justify-between items-center p-4' style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg' style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <i className='ri-robot-2-fill text-white text-xl'></i>
              </div>
              <div>
                <h1 className='font-bold text-white text-sm tracking-tight'>AI Assistant</h1>
                <p className='text-[10px] text-indigo-400 font-bold uppercase tracking-widest'>Gemini 2.5 Flash Lite (Stable)</p>
              </div>
            </div>
            <button
              onClick={() => setIsAiPanelOpen(false)}
              className='w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all'
            >
              <i className='ri-close-large-line'></i>
            </button>
          </header>

          {}
          <div
            ref={aiMessageBoxRef}
            className='flex-grow overflow-auto p-6 flex flex-col gap-4 scrollbar-hide'
          >
            {}
            {(!aiMessages || aiMessages.length === 0) && (
              <div className='flex flex-col items-center justify-center min-h-full text-center'>
                <div className='w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl' 
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <i className='ri-sparkling-2-line text-indigo-400 text-3xl animate-pulse'></i>
                </div>
                <h2 className='text-white font-bold text-xl mb-3'>Ready to Build?</h2>
                <p className='text-slate-400 text-sm max-w-[240px] mb-8 leading-relaxed'>
                  I can generate full-stack applications, analyze code, or help you debug in real-time.
                </p>
                
                <div className='flex flex-col gap-3 w-full max-w-[280px]'>
                  {[
                    { text: 'Create an Express.js server', icon: 'ri-server-line', prompt: 'Create a complete Express.js server with error handling and a sample route' },
                    { text: 'Create a React Todo App', icon: 'ri-reactjs-line', prompt: 'Create a beautiful React Todo application with state management' },
                    { text: 'Scan for Plagiarism', icon: 'ri-shield-check-line', prompt: 'Analyze the current project for plagiarism and originality' },
                  ].map((btn, i) => (
                    <button 
                      key={i}
                      onClick={() => { setAiInput(btn.prompt); }}
                      className='flex items-center gap-3 px-4 py-3 rounded-2xl text-xs text-indigo-300 bg-white/5 hover:bg-indigo-500/10 transition-all border border-white/5 hover:border-indigo-500/30 group'
                    >
                      <i className={`${btn.icon} text-lg group-hover:scale-110 transition-transform`}></i>
                      <span className='font-medium'>{btn.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {aiMessages && aiMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-slate-800/80 text-slate-200 border border-white/5 shadow-xl'
                }`}>
                  {msg.role === 'ai' ? (
                    <div className='prose prose-invert prose-sm max-w-none overflow-hidden'>
                      <Markdown
                        children={msg.text || ''}
                        options={{ overrides: { code: SyntaxHighlightedCode } }}
                      />
                    </div>
                  ) : (
                    <p className='leading-relaxed'>{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {}
            {aiLoading && (
              <div className='flex justify-start'>
                <div className='bg-slate-800/50 text-slate-400 rounded-2xl px-5 py-3 border border-white/5 flex items-center gap-3 shadow-lg'>
                  <div className='flex gap-1.5'>
                    <span className='w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></span>
                    <span className='w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce' style={{ animationDelay: '200ms' }}></span>
                    <span className='w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce' style={{ animationDelay: '400ms' }}></span>
                  </div>
                  <span className='text-xs font-medium tracking-wide'>{loadingMessages[loadingStep]}</span>
                </div>
              </div>
            )}
          </div>

          {}
          <div className='p-4 bg-slate-900/50 backdrop-blur-md border-t border-white/5'>
            <div className='flex gap-2 items-center bg-slate-800/80 rounded-2xl px-4 py-2 border border-white/10 focus-within:border-indigo-500/50 transition-all shadow-inner'>
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && aiInput.trim()) sendAiMessage(); }}
                className='flex-grow bg-transparent text-white text-sm outline-none py-2 placeholder-slate-500'
                type='text'
                placeholder='Ask AI to build something...'
                disabled={aiLoading}
              />
              <button
                onClick={sendAiMessage}
                disabled={aiLoading || !aiInput.trim()}
                className='w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:grayscale'
                style={{ 
                  background: aiInput.trim() && !aiLoading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                  boxShadow: aiInput.trim() && !aiLoading ? '0 4px 12px rgba(99,102,241,0.4)' : 'none'
                }}
              >
                <i className={`ri-send-plane-2-fill ${aiInput.trim() && !aiLoading ? 'text-white' : 'text-slate-500'} text-lg`}></i>
              </button>
            </div>
          </div>
        </div>

      </section>

      {}
      <section className="right flex-grow h-full flex" style={{ background: '#1a1a2e' }}>


        {}
        <div className="explorer h-full max-w-64 min-w-52 flex flex-col"
          style={{ background: 'rgba(15,12,41,0.7)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

          {}
          <div className='flex items-center justify-between px-3 py-3'
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span className='text-xs font-bold uppercase tracking-widest' style={{ color: 'rgba(255,255,255,0.4)' }}>Explorer</span>
            <button
              onClick={() => setIsCreatingFile(true)}
              title='New File'
              className='w-6 h-6 rounded-lg flex items-center justify-center transition-all'
              style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.3)'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}
            >
              <i className='ri-add-line text-sm'></i>
            </button>
          </div>

          {}
          {isCreatingFile && (
            <div className='flex items-center gap-1 px-2 py-1.5' style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(99,102,241,0.08)' }}>
              <i className='ri-file-add-line text-indigo-400 text-sm ml-1'></i>
              <input
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createNewFile();
                  if (e.key === 'Escape') { setIsCreatingFile(false); setNewFileName(''); }
                }}
                placeholder='filename.js'
                className='flex-grow text-sm bg-transparent text-white outline-none px-1 placeholder-slate-600'
              />
              <button onClick={createNewFile} className='text-emerald-400 hover:text-emerald-300 p-0.5'><i className='ri-check-line'></i></button>
              <button onClick={() => { setIsCreatingFile(false); setNewFileName(''); }} className='text-red-400 hover:text-red-300 p-0.5'><i className='ri-close-line'></i></button>
            </div>
          )}

          <div className='file-tree w-full flex-grow overflow-auto py-1'>

            {Object.keys(fileTree).map((file) => (
              <div
                key={file}
                className='group flex items-center justify-between px-2 py-1.5 mx-2 my-0.5 rounded-lg cursor-pointer transition-all'
                style={{
                  background: currentFile === file ? 'rgba(99,102,241,0.15)' : 'transparent',
                  borderLeft: currentFile === file ? '2px solid #6366f1' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (currentFile !== file) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (currentFile !== file) e.currentTarget.style.background = 'transparent'; }}
              >
                <button
                  onClick={() => { setCurrentFile(file); setOpenFiles([...new Set([...openFiles, file])]); }}
                  className='flex items-center gap-2 flex-grow text-left truncate'
                >
                  <i className='ri-file-code-line text-xs' style={{ color: currentFile === file ? '#818cf8' : 'rgba(255,255,255,0.4)' }}></i>
                  <span className='text-sm truncate' style={{ color: currentFile === file ? '#e0e7ff' : 'rgba(255,255,255,0.65)' }}>{file}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteFile(file); }}
                  title={`Delete ${file}`}
                  className='opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-0.5 transition-all rounded'
                >
                  <i className='ri-delete-bin-line text-xs'></i>
                </button>
              </div>
            ))}

            {Object.keys(fileTree).length === 0 && (
              <div className='flex flex-col items-center justify-center p-6 text-center'>
                <i className='ri-folder-open-line text-2xl mb-2' style={{ color: 'rgba(255,255,255,0.2)' }}></i>
                <p className='text-xs' style={{ color: 'rgba(255,255,255,0.25)' }}>No files yet.<br/>Click <strong style={{ color: '#818cf8' }}>+</strong> to create one.</p>
              </div>
            )}

          </div>

        </div>

        <div className='code-editor flex flex-col flex-grow h-full' style={{ background: '#1a1a2e' }}>

          {}
          <div className='flex justify-between items-center w-full flex-shrink-0'
            style={{ background: 'rgba(15,12,41,0.8)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

            <div className='files flex overflow-x-auto'>
              {openFiles.map((file) => (
                <button
                  key={file}
                  onClick={() => setCurrentFile(file)}
                  className='flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all flex-shrink-0'
                  style={{
                    color: currentFile === file ? '#e0e7ff' : 'rgba(255,255,255,0.4)',
                    borderBottom: currentFile === file ? '2px solid #6366f1' : '2px solid transparent',
                    background: currentFile === file ? 'rgba(99,102,241,0.1)' : 'transparent',
                  }}
                >
                  <i className='ri-file-code-line text-xs' style={{ color: currentFile === file ? '#818cf8' : 'rgba(255,255,255,0.3)' }}></i>
                  {file}
                </button>
              ))}
            </div>

            <div className='flex items-center gap-2 pr-3'>
              <button
                onClick={() => {
                  saveFileTree(fileTree);
                }}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all'
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
              >
                <i className='ri-save-3-line'></i> Save Changes
              </button>
            </div>
          </div>

          <div className="bottom flex flex-grow max-w-full shrink overflow-auto">

            {

              fileTree[currentFile] && (
                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                  <pre
                    className="hljs h-full">
                    <code
                      className="hljs h-full outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updatedContent = e.target.innerText;
                        const ft = {
                          ...fileTree,
                          [currentFile]: {
                            file: {
                              contents: updatedContent
                            }
                          }
                        }
                        setFileTree(ft)
                        saveFileTree(ft)
                      }}
                      dangerouslySetInnerHTML={{ __html: hljs.highlight(getLanguage(currentFile), fileTree[currentFile]?.file?.contents || '').value }}
                      style={{
                        whiteSpace: 'pre-wrap',
                        paddingBottom: '25rem',
                        counterSet: 'line-numbering',
                      }}
                    />
                  </pre>
                </div>
              )
            }

            {}
            {!fileTree[currentFile] && (
              <div className='flex-grow flex flex-col items-center justify-center text-center'
                style={{ background: '#1a1a2e' }}>
                <div className='w-20 h-20 rounded-2xl flex items-center justify-center mb-5'
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <i className='ri-code-s-slash-line text-3xl' style={{ color: '#6366f1' }}></i>
                </div>
                <h2 className='text-lg font-semibold mb-2' style={{ color: 'rgba(255,255,255,0.6)' }}>No file open</h2>
                <p className='text-sm' style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Select a file from the explorer or click <strong style={{ color: '#818cf8' }}>+</strong> to create one.
                </p>
              </div>
            )}

          </div>

        </div>

        {iframeUrl && webContainer && (
          <div className='flex min-w-96 flex-col h-full' style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
            <div className='px-2 py-2 flex items-center gap-2'
              style={{ background: 'rgba(15,12,41,0.8)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <i className='ri-global-line text-slate-500 text-sm'></i>
              <input type='text'
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl}
                className='flex-grow text-xs outline-none rounded-lg px-3 py-1.5'
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <iframe src={iframeUrl} className='w-full h-full' style={{ background: '#fff' }} />
          </div>
        )}

      </section>

      {}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>

          <div className='w-full max-w-md mx-4 rounded-2xl overflow-hidden'
            style={{ background: 'rgba(20,17,50,0.98)', border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>

            <header className='flex items-center justify-between px-5 py-4'
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className='flex items-center gap-2'>
                <i className='ri-user-add-line text-indigo-400'></i>
                <h2 className='text-white font-semibold'>Add Collaborator</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)}
                className='w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors'
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <i className='ri-close-line'></i>
              </button>
            </header>

            <div className='p-3 max-h-72 overflow-auto flex flex-col gap-1'>
              {users.map(u => (
                <div key={u._id}
                  onClick={() => handleUserClick(u._id)}
                  className='flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all'
                  style={{
                    background: selectedUserId.has(u._id) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    border: selectedUserId.has(u._id) ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className='w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0'
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {u.email[0]?.toUpperCase()}
                  </div>
                  <span className='text-sm text-white flex-grow truncate'>{u.email}</span>
                  {selectedUserId.has(u._id) && <i className='ri-check-line text-indigo-400'></i>}
                </div>
              ))}
            </div>

            <div className='p-4' style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={addCollaborators}
                className='w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all'
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}>
                <i className='ri-user-add-line mr-2'></i>Add Selected
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default Project
