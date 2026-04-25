import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { UserProvider } from './context/user.context'; 
import NotificationHandler from './components/NotificationHandler';

const App = () => {
  return (
    <UserProvider>
      < AppRoutes />
    </UserProvider>
  )
}

export default App
