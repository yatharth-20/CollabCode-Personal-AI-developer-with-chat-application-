import React, {useState, useEffect, useContext} from 'react'
import { useNavigate,  useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, recieveMessage, sendMessage } from '../config/socket'
import {UserContext} from '../context/user.context'

const Project = () => {
  
  const location = useLocation();
  
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(location.state?.project || null);
  const [message, setMessage] = useState('');
  const {user} = useContext(UserContext);

  const [users, setUsers] = useState([]);

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
      projectId : project?._id || location.state?.project?._id,
      users : Array.from(selectedUserId)
    }).then(res => {
      console.log(res.data);
      setIsModalOpen(false); 
    }).catch(err => {
      console.log(err);
    })
    
  }

  function send() {
    sendMessage('project-message', {
      message,
      sender : user._id
    })

    setMessage("");
    
  }
  

  useEffect(() => {
    const projectId = location.state?.project?._id || project?._id;
    if (!projectId) return;

    initializeSocket(projectId);

    recieveMessage('project-message', data => {
      console.log('Received project message for socket :', data);
    });

    axios.get(`/projects/get-project/${projectId}`).then(res => {
      console.log(res.data.project);
      setProject(res.data.project);
    }).catch(err => {
      console.log(err);
    })

    axios.get('/users/all').then(res => {
      setUsers(res.data.users);
    }).catch(err => {
      console.log(err);
    })

  }, [location.state?.project?._id, project?._id])
  
  return (
   <main
    className='h-screen w-screen flex '
   >
      <section className="left relative flex flex-col h-full min-w-100 bg-slate-300">

        <header
          className="flex justify-between items-center p-2 px-4 w-full bg-slate-200"
        >

          <div className='flex items-center gap-4'>
            <button
              onClick={() => setIsModalOpen(true)}
              className='flex gap-2 items-center px-3 py-2 bg-slate-100 rounded-md hover:bg-slate-200'
            >
              <i className="ri-add-fill mr-1"></i>
              <p className='text-sm'>Add Collaborator</p>
            </button>

          </div>

          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className='p-2'
          >

            <i className='ri-group-fill cursor-pointer'></i>

          </button>

        </header>
        
        <div className="conversation-area grow flex flex-col">

          <div className="message-box grow flex flex-col p-2 gap-3">

            {/* Incoming Message */}

            <div className="message max-w-56 flex flex-col gap-1 p-2 bg-slate-50 w-fit rounded-md">

              <small
              className='opacity-60 text-xs'
              >example@gmail.com</small>

              <p className='text-sm'>Lorem ipsum dolor sit amet.</p>

            </div>

            {/* Your Message */}

            <div className="ml-auto max-w-56 message flex flex-col gap-1 p-2 bg-slate-50 w-fit rounded-md">

              <small
              className='opacity-60 text-xs'
              >example@gmail.com</small>

              <p className='text-sm'>Lorem ipsum dolor sit amet.</p>

            </div>

          </div>

          <div className="inputField w-full flex">

            <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="p-2 px-20 rounded-md bg-white border-none outline-none grow" 
            type="text" placeholder='Enter Message' />

          {/* SEND BUTTON */}
          
            <button
            onClick={send}
            className='px-3'
            ><i className='ri-send-plane-fill p-2 rounded-2xl cursor-pointer bg-green-400'></i></button>

          </div>
          
        </div>

        <div className={`sidePanel w-full h-full flex flex-col gap-2 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0 bg-slate-50`}>

          <header className='flex justify-between items-center p-2 px-4 bg-slate-300'>

            <h1
              className='font-semibold text-lg'
            >Collaborators</h1>

            <button
              onClick={() => setIsSidePanelOpen(false)}
              className='p-2'
            >
              <i className=" cursor-pointer ri-close-large-line"></i>
            </button>
            
          </header>

          <div className="users flex flex-col gap-2 p-2">







            {project.users &&  project.users.map(user => {
              return (
                <div 
                key={user._id}
                className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">

                  <div
                  className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'
                  >
                    <i className="ri-user-fill absolute"></i>
                  </div>

                  <h1 
                  className='font-semibold text-lg'
                  >{user.email}</h1>
                  
                </div>
              )
            })}
            
          </div>
          
        </div>
        
      </section>

      {/* Modal: Users list */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}

          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 md:mx-0 overflow-hidden">
            
            <header className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">Select a user</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-600 hover:text-slate-800"
                aria-label="Close users modal"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </header>


            {/* content area: give bottom padding so items aren't covered by footer */}
            <div className="p-4 max-h-72 overflow-auto pb-24">
                {users.map(user => (

                  <div key={user._id} className={`user cursor-pointer hover:bg-slate-200 ${selectedUserId.has(user._id) ? 'bg-slate-200' : ""} p-2 flex gap-2 items-center`} onClick={() => handleUserClick(user._id)}>
                                    
                    <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                        <i className="ri-user-fill absolute"></i>
                    </div>

                    <h1 className='font-semibold text-lg'>{user.email}</h1>

                  </div>
                ))}
                
            </div>


            {/* Footer: non-overlapping Add Collaborator button */}
            <div className="border-t p-4 bg-white">
              <button
                onClick={addCollaborators}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md"
              >
                Add Collaborator
              </button>
            </div>

          </div> 
          
        </div>
      )}
      
   </main>
  )
}

export default Project
