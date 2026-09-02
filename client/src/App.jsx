import React from 'react'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import ProtectedLayout from './components/ProtectedLayout'
import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import Pricing from './pages/Pricing'
import MeetingRoom from './pages/MeetingRoom'
import Login from './pages/Login'

const App = () => {
  return (
    <>
      <Toaster/>
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<Login mode="login"/>}/>
        <Route path='/register' element={<Login mode="register"/>}/>

        {/* Private Routes*/}
        <Route element={<ProtectedRoute/>}>
          <Route element={<ProtectedLayout/>}>
            <Route path='/dashboard' element={<Dashboard/>}/>
            <Route path='/sessions' element={<Sessions/>}/>
            <Route path='/pricing' element={<Pricing/>}/>
          </Route>
          <Route path='/meeting/:meetingId' element={<MeetingRoom/>}/> 
        </Route>

        {/* {Other Routes} */}
        <Route path='*' element={<Navigate to='/dashboard' replace/>}/>
      </Routes>
    </>
  )
}

export default App
