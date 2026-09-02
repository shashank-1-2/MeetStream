import React, { useEffect, useState } from 'react'
import { ArrowRightIcon, KeyboardIcon, PlusIcon, ShieldCheckIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser, useAuth } from '@clerk/react';
import api from '../config/api.js';

const Dashboard = () => {

  const {user} = useUser();
  const userName = user?.fullName || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  const {isLoaded, isSignedIn, getToken} = useAuth();

  const navigate = useNavigate()

  const [isCreating, setIsCreating] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState(null) 

  const [joinId, setJoinId] = useState("")

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer)
  },[])

  useEffect(()=>{
    const fetchStats = async () => {
      if(!isLoaded || !isSignedIn) return;

      try {
        const token = await getToken();
        const {data} = await api.get("/api/meetings/stats", {
          headers: {Authorization: `Bearer ${token}`},
        })
        setStats(data)
      } catch (error) {
        toast.error(error.response?.data?.error || error.message)
      }
    };
    fetchStats();
  },[isLoaded, isSignedIn, getToken])

  const handleCreateMeeting = async() => {
    if(!isLoaded || !isSignedIn) return;

    setIsCreating(true)
    
    try {
      const token = await getToken();
      const res = await api.post("/api/meetings", {title: `${userName}'s Meeting`}, {
        headers: {Authorization: `Bearer ${token}`,},
      })
      const meetingId = res.data.meeting.meetingId;
      toast.success("Meeting Created!");
      navigate(`/meeting/${meetingId}`);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
    }finally{
      setIsCreating(false);
    }
  }

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    const cleanId = joinId.trim();
    
    // FIX 1: Allow 3-4-3 format (e.g., abc-defg-hij)
    if(!/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(cleanId)){
      toast.error("Please enter a valid Meeting Id");
      return;
    }
    
    try {
      const token = await getToken();
      await api.get(`/api/meetings/${cleanId}`, {headers: {Authorization: `Bearer ${token}`}});
      
      // FIX 2: Actually navigate the user to the meeting room upon success
      navigate(`/meeting/${cleanId}`);
    } catch (error) {
      toast.error("Meeting not found. Check the ID and try again.");
    }
  }

  return (
    <div className='flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 flex flex-col justify-center'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-center'>

        {/* {Left Column - Actions} */}
        <div className='lg:col-span-7 space-y-8'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 px-3.5 pr-6 py-2 rounded-full bg-white/25 text-xs font-medium'>
              <ShieldCheckIcon size={16} />
              Secure Peer-to-Peer Encryption 
            </div>
            <h1 className='text-4xl sm:text-5xl text-slate-800 leading-tight font-medium'>
              High quality video calls <br />
              <span className='text-primary'>Built for Everyone</span>
            </h1>
            <p className='text-slate-700 text-base sm:text-lg max-w-xl leading-relaxed'>
              Connect, collaborate, and celebrate from anywhere with ultra-low latency video, screen sharing, and real-time chat
            </p>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2'>
              <button 
              onClick={handleCreateMeeting}
              disabled={isCreating}
              className='bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3.5 rounded-full shadow-md shadow-primary/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50'>
                <PlusIcon className="w-5 h-5" />
                <span>{isCreating ? "Creating.." : "New Meeting"}</span>
              </button>

              <form onSubmit={handleJoinMeeting} className='flex-1 flex items-center gap-2'>
                <div className='relative flex-1'>
                  <KeyboardIcon className="w-5 h-5 text-primary/90 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Enter meeting code (ex. abc-defg-hij)" 
                  value={joinId} onChange={(e) => setJoinId(e.target.value)} 
                  className='w-full bg-white/75 border border-primary-border/80 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 rounded-full pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all' />
                </div>
                <button type='submit'
                disabled={!joinId.trim()}
                className='bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-white font-medium px-6 py-3.5 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-xs' >
                  <span>Join</span>
                  <ArrowRightIcon className='w-4 h-4 ml-1.5' />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* {Right Column - Hero Graphics & Clock Card} */}
        <div className='lg:col-span-5 flex flex-col items-center justify-center space-y-4'>
          <div className='w-full bg-white/25 backdrop-blur rounded-4xl p-8 border border-slate-200 text-center space-y-6 relative overflow-hidden'>
            <div className='space-y-1'>
              <p className='mb-5 text-xl text-left'>Hi, <span className='font-medium'>{userName}</span> </p>
              <h2 className='text-4xl xl:text-7xl my-4 text-slate-900 tracking-wide'>
                {currentTime.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
              </h2>
              <p className='font-medium tracking-wide text-primary'>
                {currentTime.toLocaleDateString(undefined, {weekday:"long", 
                                                            month:"short", 
                                                            day:"numeric", 
                                                            year:"numeric"})}
              </p>
            </div>
            
            <div className='pt-4 border-t border-white/30 text-sm text-slate-600'>
              
              {/* Row 1: Email and Plan Badge */}
              <div className='flex items-center justify-between py-6 px-4'>
                <p>Logged in as: <span className='text-slate-900'>{userEmail}</span> </p>
                <span className={`px-4 rounded-full font-semibold text-xs uppercase ${stats?.plan === "premium" ? "bg-blue-700 text-white" : "bg-white/70 text-slate-800"}`}>
                  {stats?.plan || "Free"}
                </span>
              </div>
              
              {/* Row 2: Monthly Meetings block */}
              {stats && (
                <div className="w-full bg-white/50 rounded-2xl px-5 py-4 border border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span>Monthly Meetings</span>
                    <span className="text-xs text-slate-600 font-mono">
                      {stats.monthlyLimit 
                      ? `${stats.monthlyCount} / ${stats.monthlyLimit} Used` 
                      : `${stats.monthlyCount} Created (Unlimited)`}
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard