import { ArrowLeftIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmptySessions from '../components/sessions/EmptySessions'
import SessionCard from '../components/sessions/SessionCard'
import SessionDetailModal from '../components/sessions/SessionDetailModal'
import { useAuth } from '@clerk/react'
import api from '../config/api.js'
import toast from 'react-hot-toast'
import Loader from '../components/Loader.jsx'

const Sessions = () => {

  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);

  const {isLoaded, isSignedIn, getToken} = useAuth()

  useEffect(()=>{
    const fetchSessions = async (params) => {
      if(!isLoaded || !isSignedIn) return;

      try {
        const token = await getToken();
        if(!token) return;
        const res = await api("/api/meetings/sessions",{headers: {Authorization:`Bearer ${token}`,}})
        setSessions(res.data.meetings || [])
      } catch (_error) {
        toast.error("Failed to load meeting sessions");
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();

  },[isLoaded, isSignedIn, getToken])


  const openSessionDetails = async (sessionId) => {
    try {
      const token = await getToken();
      const res = await api.get(`/api/meetings/sessions/${sessionId}`,{
        headers: {Authorization: `Bearer ${token}`,}
      })
      setSelectedSession(res.data.meeting)
    } catch (error) {
      toast.error("Could not fetch session details");
    }
  }
  if(loading){
    return <Loader text="Loading meeting history..."/>
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12">
      {/* Page Title & Navigation Header */}
      <Link to="/dashboard" className="flex items-center text-sm gap-1 mb-4 text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeftIcon size={14}/> Go to Dashboard
      </Link>
      <div className='mb-8'>
        <h1 className='text-3xl font-medium tracking-tight text-slate-900'>Meeting sessions.</h1>
        <p className='text-sm text-slate-500 mt-1'>Review your past and active meeting history, participant logs, and chat transcripts.</p>
      </div>

      {/* {Sessions Grid / Empty State} */}
      {
        sessions.length === 0 ? (
          <EmptySessions />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'> {/* Added spacing for better UI */}
            {/* Corrected mapping logic below */}
            {sessions.map((session) => (
              <SessionCard 
                key={session.id || session.meetingId}
                session={session}
                onOpenDetails={openSessionDetails}
                onRejoin={(meetingId) => navigate(`/meeting/${meetingId}`)}
              />
            ))}
          </div>
        )
      }

      {/* {Session Detail Modal} */}
      <SessionDetailModal session={selectedSession} onClose={()=> setSelectedSession(null)} />

    </main>
  )
}

export default Sessions