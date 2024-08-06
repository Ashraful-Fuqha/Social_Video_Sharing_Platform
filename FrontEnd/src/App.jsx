import { Outlet } from "react-router-dom"
import NavBar from "./components/NavBar"

function App() {
 
  return (
    <>
      <div className="px-3 mx-auto min-h-screen w-full font-mono">
        <NavBar/>
        <main>
          <Outlet/>
        </main>
      </div>
    </>
  )
}

export default App
