import React from 'react'
import { useNavigate,  useLocation } from 'react-router-dom'

const Project = () => {
  
  const location = useLocation();

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
              className="p-2 px-20 rounded-md bg-white border-none outline-none" 
              type="text" placeholder='Enter Message' />

              <button
              className='grow'
              ><i className='ri-send-plane-fill p-2 rounded-2xl cursor-pointer bg-green-400'></i></button>

            </div>
          
        </div>

        <div className="sidePanel w-36 h-60 absolute -left-full top-0 bg-green-400"></div>
        
      </section>

   </main>
  )
}

export default Project
