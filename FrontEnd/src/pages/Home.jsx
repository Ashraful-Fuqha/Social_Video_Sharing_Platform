/* eslint-disable no-unused-vars */
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { VideoCard } from "@/components/ui/VideoCard"
import { formatDuration, timeSince } from "@/utils/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from "react"
import { useGetAllVideosQuery } from "@/store/api/apiSlice"

function Home() {
    const {data, loading} = useSelector((state) => state.content)
    const { isLoggedIn } = useSelector((state) => state.auth)
    const {data: content, } = useGetAllVideosQuery()
    
    let skeletons
    if(data){
     skeletons =  Array(data?.totalDocs).fill(null) || Array(8).fill(null)
    }
    
    if(data == null){
      return (
        isLoggedIn ? (
          <> 
            <div className="absolute w-64 top-[40%] left-[50%] -translate-x-2/4 -translate-y-2/4 text-center">
              <h2 className="text-xl tracking-wider mb-2 text-teal-600 dark:text-rose-400 font-semibold">No Videos for you</h2>
              <p className="tracking-wide">You have an opportunity to start with us</p>
            </div>
          </>
        ) : (
          <>
            <div className="absolute w-72 top-[40%] left-[50%] -translate-x-2/4 -translate-y-2/4 text-center">
              <h2 className="text-xl tracking-wider mb-2 text-teal-600 dark:text-rose-400 font-semibold">Please Login to access videos <Link to={'/login'} className="text-purple-600 font-semibold dark:text-purple-400">Login</Link> Or <Link to={'/signup'} className="text-purple-600 font-semibold dark:text-purple-400">Signup</Link></h2>
              {/* <p className="tracking-wide">{error}</p> */}
            </div>
          </>
        )
      )
    }

    const onClick = (videoId) => {
    // Handle the click event here
    console.log(`Clicked video with ID: ${videoId}`);
    };

  return (
    <div className="md:grid md:grid-cols-4 md:grid-flow-col md:gap-5 flex flex-col">
      {
        loading ? (
        skeletons && skeletons.map((_, index) => (
            <div key={index} className="flex flex-col space-y-3 w-full min-h-[16rem] max-w-[400px] md:w-full my-8 sm:my-4">
              <Skeleton className="h-[208px] w-full rounded-xl" />
              <div className="space-y-2 h-[95.2px] flex flex-col pb-8">
                <Skeleton className="flex-1" />
                <Skeleton className="flex-1" />
              </div>
            </div>
          )
        )) : 
        
        
        data && (data.docs?.map((video) => (
              <VideoCard
                key={video._id}
                className="min-h-[16rem] w-full max-w-[400px] md:w-full my-3 sm:my-4"
                title={video.title}
                thumbnail={video.thumbnail.url}
                description={video.description}
                channelAvatar={video.ownerDetails.avatar.url}
                channelName={video.ownerDetails.fullname}
                views={video.views}
                postedOn={timeSince(video.createdAt) + " ago" }
                duration={formatDuration(video.duration)}
                onClickFunction={() => onClick(video.duration)}
              />
          ))
        )}
    </div>
  )
}

export {Home}
