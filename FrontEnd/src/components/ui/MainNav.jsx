import { Button } from "./button"

const mainNavItems = ['A','B','C']

function MainNav() {
  return (
    <div className="mr-4 hidden gap-2 md:flex">
        {mainNavItems.map((item,i) => 
            <Button key={i} variant="link">
                {item}
            </Button>    
        )}
    </div>
  )
}

export default MainNav