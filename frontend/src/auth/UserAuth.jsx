import React, {useContext, useEffect, useState} from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'

const UserAuth = ({ children }) => {

    const { user, setUser } = useContext(UserContext);

    const [loading, setLoading] = useState(true);
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();
    
    useEffect(() => {
        
        if(!token) {
            navigate('/login');
            return;
        }

        
        
        if(!user) {
            axios.get('/users/profile')
                .then((res) => {
                    setUser(res.data.user);
                    setLoading(false);
                })
                .catch((_err) => {
                    sessionStorage.removeItem('token');
                    navigate('/login');
                });
        } else {
            setLoading(false);
        }
        
    }, []);

    if(loading) {
        return <div>Loading...</div>
    }

  return (
    <>
      {children}
    </>
  )
}

export default UserAuth
