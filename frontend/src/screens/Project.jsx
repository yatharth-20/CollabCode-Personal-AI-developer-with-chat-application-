import React, {useState, useEffect} from 'react'
import { useNavigate,  useLocation } from 'react-router-dom'

const Project = () => {
  
  const location = useLocation();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // use users from location.state if provided, otherwise sample users
  const sampleUsers = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
    { id: '3', name: 'Carol Lee', email: 'carol@example.com' },
    { id: '4', name: 'Dave Kim', email: 'dave@example.com' },
  ]
  const users = location.state?.users || sampleUsers

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setIsModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  console.log(location.state);
  
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

            {selectedUserId && (
              <div className='text-xs text-slate-600'>
                Selected ID: <span className='font-semibold'>{selectedUserId}</span>
              </div>
            )}
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
              className="p-2 px-20 rounded-md bg-white border-none outline-none grow" 
              type="text" placeholder='Enter Message' />

              <button
              className='px-3'
              ><i className='ri-send-plane-fill p-2 rounded-2xl cursor-pointer bg-green-400'></i></button>

            </div>
          
        </div>

        <div className={`sidePanel w-full h-full flex flex-col gap-2 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0 bg-slate-50`}>

          <header className='flex justify-end p-2 px-4 bg-slate-300'>

            <button
              onClick={() => setIsSidePanelOpen(false)}
              className='p-2'
            >
              <i className=" cursor-pointer ri-close-large-line"></i>
            </button>
            
          </header>

          <div className="users flex flex-col gap-2 p-2">

            <div className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">

              <div
              className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'
              >
                <i className="ri-user-fill absolute"></i>
              </div>

              <h1 
              className='font-semibold text-lg'
              >User</h1>
              
            </div>
            
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
              <ul className="space-y-3">
                {users.map(user => (
                  <li
                    key={user.id}
                    onClick={() => {
                      setSelectedUserId(user.id)
                      // setIsModalOpen(false)
                    }}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-slate-100 ${
                      selectedUserId === user.id ? 'ring-2 ring-offset-2 ring-indigo-300 bg-indigo-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center">
                      <i className="ri-user-fill"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-xs text-slate-400">{user.id}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer: non-overlapping Add Collaborator button */}
            <div className="border-t p-4 bg-white">
              <button
                onClick={() => setIsModalOpen(false)}
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
