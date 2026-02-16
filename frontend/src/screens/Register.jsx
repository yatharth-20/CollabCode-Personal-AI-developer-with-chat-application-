import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

// test user -> test@tester.com
// password -> tester

const Register = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const {setUser} = useContext(UserContext);

  const navigate = useNavigate();

  function submitHandler(e) {

    e.preventDefault();

    axios.post('/users/register', {
      email,
      password
    }).then((res) => {
      console.log(res.data)
      
      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)

      navigate('/')
    }).catch((err) => {
      console.log(err.response.data)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Register</h2>

        <form onSubmit={submitHandler}>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}

              onChange={(e) => setEmail(e.target.value)}

              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:   ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}

              onChange={(e) => setPassword(e.target.value)}

              className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Create Account
          </button>
        </form>

        <p className="text-gray-400 mt-4">
          Already have an account ?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
