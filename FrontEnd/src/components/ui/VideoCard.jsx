/* eslint-disable react/prop-types */
import { Avatar } from "./avatar"
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { EllipsisVertical, Share2Icon, Eye, SaveAll, GripIcon } from "lucide-react"
import { DropdownMenu,DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { 
    Card,
    CardContent,
    CardFooter, } from "./card"
import { AspectRatio } from "./aspect-ratio"

function VideoCard({
    title,
    thumbnail,
    duration,
    views,
    channelName,
    channelAvatar,
    postedOn,
    onClickFunction,
    className
}) {
  return (
    <>
        <Card className={`border-none rounded-[0.8rem] overflow-hidden ${className}`} onClick={onClickFunction}>
            <CardContent className="w-full h-[15rem] md:h-[13rem] min-[558px]:h-[17rem] p-0 mb-2 relative">
                <AspectRatio ratio={16 / 11}>
                    <img src={thumbnail} alt="" className="w-full h-full object-cover"/>
                </AspectRatio>
                <span className="absolute bg-black/60 text-xs px-1 rounded-sm font-semibold bottom-1.5 right-3 text-white py-0.5">{duration}</span>
            </CardContent>
            <CardFooter className="p-3 flex items-start justify-between">
                <div className="flex gap-3.5 items-start">
                    <Avatar className="">
                        <AvatarImage src={channelAvatar} className="object-fill" alt={channelName} />
                        <AvatarFallback>{channelName}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-base leading-[1.2rem] overflow-hidden overflow-ellipsis line-clamp-3 font-semibold text-gray-700 dark:text-white w-[80%] m-0 mb-2">{title}</h3>
                        <p className="text-sm text-slate-500">{channelName}</p>
                        <p className="text-sm text-slate-500"><span>{views} views </span><span className="before:content-['•'] before:pr-2">{postedOn}</span></p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <EllipsisVertical size={18} className="cursor-pointer active:scale-75" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-58 z-10 relative bg-[rgb(70,70,70)] p-5 mr-8 md:ml-[17rem] mt-1 md:mt-3 text-white rounded-md">
                        
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                        <DropdownMenuItem className="flex gap-3 mb-3">
                            <GripIcon/>Description
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex gap-3 mb-3">
                            <SaveAll/>Save to Playlist
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex gap-3 mb-3">
                            <Eye/>Save to Watch Later
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex gap-3">
                            <Share2Icon/>Share
                        </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    </>

  )
}

export {VideoCard}