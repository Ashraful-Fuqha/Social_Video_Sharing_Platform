import MobileNav from "./ui/MobileNav"
import SearchBar from "./ui/SearchBar"

function NavBar() {
  return (
    <>
        <header className="min-w-full border-b-2 border-purple-600 m-0 sticky top-0 z-10 backdrop-blur-sm">
            <div className="flex md:h-14 h-12 justify-between items-center">
                {/* <MainNav/> */}
                <MobileNav/>
                <SearchBar/>
            </div>
        </header>
    </>    
  )
}

export default NavBar