import { Search } from "lucide-react"
import { Avatar } from "./avatar"
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
function SearchBar() {

  return (
    <div className="">
        <div className="items-center max-w-screen-xl mx-auto">
          <div className="flex md:justify-normal justify-center items-center py-3">
            <h1 className="text-3xl md:text-4xl ml-2 uppercase md:mr-5 font-bold text-purple-600">Social.</h1>
            <form className="md:ml-auto ml-1 rounded-lg flex md:px-2 px-1 md:mr-5 mr-[.4rem] items-center space-x-2 border-b-2 border-b-purple-600">
              <Search className="h-6 w-6 text-purple-600" />
              <input
                className="w-full py-[.2rem] outline-none bg-transparent appearance-none  placeholder-gray-500 text-gray-500 sm:w-64 md:w-80"
                type="text"
                placeholder="Search"
              />
            </form>
            <Avatar className="">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>Sadiq</AvatarFallback>
            </Avatar>
          </div>
      </div>
    </div>
  )
}

export default SearchBar