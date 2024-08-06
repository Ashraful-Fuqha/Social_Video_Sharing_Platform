import {
    Sheet, 
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./button"
import {Menu as MenuIcon} from 'lucide-react'
import { useState } from "react"
import { MenuItems } from "@/index"
import { Avatar } from "./avatar"
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"


function MobileNav() {
  const [open,setOpen] = useState(false)

  return (
    <>
     <Sheet open={open} onOpenChange={setOpen}>
      {/* This button will trigger open the mobile sheet menu */}
      <SheetTrigger asChild className="h-7 md:h-8">
        <Button variant="ghost" size="icon" className="text-white bg-purple-600">
          <MenuIcon />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="md:w-[15rem] w-[12rem]">
        <Avatar className="">
            <AvatarImage src="https://github.com/shadcn.png" className="object-fill" alt="@shadcn" />
            <AvatarFallback>Sadiq</AvatarFallback>
        </Avatar>
        <h1 className="text-4xl my-3 text-purple-600 font-bold">Social.</h1>
        <div className="flex flex-col items-start">
          {MenuItems.map((item) => (
            <Button key={item.id} variant="link" className="text-[1rem]" onClick={() => { setOpen(false); }} >
              {item.txt}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
    </>
  )
}

export default MobileNav