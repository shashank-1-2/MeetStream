import { CalculatorIcon, MessageSquareIcon, UsersIcon } from 'lucide-react'

const SessionCard = ({ session, onOpenDetails, onRejoin }) => {

    const isEnded = session.status === "ended"

  return (
    <div className="bg-white/70 backdrop-blur rounded-3xl p-6 transition-all flex flex-col justify-between space-y-5 border border-slate-100/60 shadow-xs">
        <div className="space-y-3">
            <div className='flex items-center justify-between'>
                <span className='text-xs font-mono text-slate-500 font-medium bg-slate-500/5 px-2.5 py-1 rounded-md'>ID: {session.meetingId}</span>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${isEnded ? "bg-slate-500/5 text-slate-500" : "bg-emerald-500/5 text-emerald-500"}`}>

                    <span className={`size-1.25 rounded-full ${isEnded ? "bg-slate-400" : "bg-emerald-500"}`} />
                    {isEnded ? "Ended" : "Active"}
                </span>
            </div>
            <h3 className="text-xl font-medium text-slate-900 truncate">{session.title || "Instant Meeting"}</h3>
            <p className='text-xs text-slate-400 flex items-center gap-1.5'>
                <CalculatorIcon className="w-3.5 h-3.5 text-slate-400" />
                {new Date(session.createdAt).toLocaleDateString(undefined,{
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })} 
            </p>
        </div>
        
        {/* Stats Row */}
        <div className='grid grid-cols-2 gap-3 pt-3 border-t border-slate-300/30'>
            <div className='flex items-center gap-2 text-xs bg-slate-500/5 p-2.5 rounded-xl'>
                <UsersIcon className="w-4 h-4 text-primary" />
                <span>
                    <strong className='font-semibold text-slate-900'>{session.participants?.length || 0}</strong> Participants
                </span>
            </div>

            <div className='flex items-center gap-2 text-xs bg-slate-500/5 p-2.5 rounded-xl'>
                <MessageSquareIcon className="w-4 h-4 text-primary" />
                <span>
                    <strong className='font-semibold text-slate-900'>{session.messages?.length || 0}</strong> Messages
                </span>
            </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
            <button onClick={()=> onOpenDetails(session.meetingId)}
                className='w-full bg-slate-400/10 hover:bg-slate-400/20 text-slate-800 font-medium py-2.5 px-4 rounded-full text-xs transition-all cursor-pointer text-center'>
                View Details
            </button>
            {!isEnded && (
                <button onClick={()=> onRejoin(session.meetingId)}
                    className='w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-4 rounded-full text-xs transition-all shadow-xs cursor-pointer text-center'>
                    Re-join
                </button>
            )}
        </div>
    </div>
  )
}

export default SessionCard