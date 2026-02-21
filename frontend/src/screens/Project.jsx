import React, {useState} from 'react'
import { useNavigate,  useLocation } from 'react-router-dom'

const Project = () => {
  
  const location = useLocation();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  console.log(location.state);
  
  return (
   <main
    className='h-screen w-screen flex '
   >
      <section className="left relative flex flex-col h-full min-w-100 bg-slate-300">

        <header
          className="flex justify-end p-2 px-4 w-full bg-slate-200"
        >

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
              <i class=" cursor-pointer ri-close-large-line"></i>
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

   </main>
  )
}

export default Project
