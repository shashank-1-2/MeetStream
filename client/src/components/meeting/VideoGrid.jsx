import React from 'react'
// If you didn't move VideoTile into the meeting folder, change this to: import VideoTile from '../VideoTile'
import VideoTile from './VideoTile' 

const VideoGrid = ({localStream, localUser, remoteUsers, audioEnabled, videoEnabled}) => {
  const totalParticipants = 1 + remoteUsers.length

  // Determine grid columns dynamically
  const getGridClass = () => {
    if (totalParticipants === 1) return "grid-cols-1 max-w-4xl";
    if (totalParticipants === 2) return "grid-cols-1 md:grid-cols-2 max-w-5xl";
    if (totalParticipants <= 4) return "grid-cols-1 md:grid-cols-2 max-w-5xl";
    if (totalParticipants <= 6) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-7xl"
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full grid gap-4 ${getGridClass()} aspect-video max-h-[calc(100vh-140px)] transition-all duration-300`}>
        {/* Local User Tile */}
        <VideoTile stream={localStream}
        name={localUser?.fullName || "You"} 
        isLocal={true}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}/>

        {/* Remote Users Tiles */}
        {remoteUsers.map((remote)=>(
          <VideoTile
          key={remote.socketId}
          stream={remote.stream}
          name={remote.userName}
          isLocal={false}
          audioEnabled={remote.audioEnabled}
          videoEnabled={remote.videoEnabled}/>
        ))}
      </div>
    </div>
  )
}

export default VideoGrid