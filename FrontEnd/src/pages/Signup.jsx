import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDispatch } from "react-redux"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { RevertSuccess } from "@/store/Slices/authSlice"
import { ErrorComp } from "@/components/ErrorComp"
import { ColorRing } from "react-loader-spinner"
import { useGetRegisteredMutation } from "@/store/api/apiSlice"

function Signup() {
    const [AsyncRegister,{isLoading, isSuccess, isError, error}] = useGetRegisteredMutation()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const {register, handleSubmit, formState:{errors}} = useForm()

    useEffect(() => {
        if(isSuccess){
            dispatch(RevertSuccess())
            navigate("/login")
        }
    })

    const onSubmit = async(data) => {
        const formData = new FormData()
        formData.set("fullname", data.fullname)
        formData.set("username", data.username)
        formData.set("password", data.password)
        formData.set("email", data.email)

        if(data.avatar){
            formData.set("avatar", data.avatar.item(0))
        }
        if(data.coverImage){
            formData.set("coverImage", data.coverImage.item(0))
        }

       dispatch(AsyncRegister(formData))
    }

  return (
    <>
        <div className='grid place-items-center m-5'>
            <Card className="w-[450px] max-h-[800px]">
                <CardHeader className="mt-0">
                    <CardTitle className="text-3xl">Signup</CardTitle>
                    <CardDescription className="text-purple-600 text-[.9rem] font-semibold">Be a member of Social.</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <CardContent>
                            {isError && 
                                <ErrorComp
                                className=""
                                title="Error"
                                description={error}
                                icon="destructive"
                                alertVariant="destructive"
                                />
                            }
                            {isSuccess && 
                                <ErrorComp
                                className=""
                                title="Registered"
                                description="Registered successfully"
                                icon="destructive"
                                alertVariant="destructive"
                                />
                            }
                            <div className="flex flex-col space-y-2 mb-2">
                                <Label htmlFor="fullname" className="text-base font-semibold ml-2">{errors.fullname ? (<span className="text-red-500 text-[.7rem]">{errors.fullname.message}</span>) : "Fullname"}</Label>
                                <Input type="text" placeholder="Enter your name..." id="fullname"
                                {...register("fullname", {
                                    required:{value:true, message: "Please enter your fullname"}
                                })}
                                 />
                            </div>
                            <div className="flex flex-col space-y-2 mb-2">
                                <Label htmlFor="username" className="text-base font-semibold ml-2">{errors.username ? (<span className="text-red-500 text-[.7rem]">{errors.username.message}</span>) : "Username"}</Label>
                                <Input type="text" placeholder="Enter your username..." id="username"
                                {...register("username",{
                                    required:{value:true, message: "Please enter your username"}
                                })}
                                />
                            </div>
                            <div className="flex flex-col space-y-2 mb-2">
                                <Label htmlFor="email" className="text-base font-semibold ml-2">{errors.email ? (<span className="text-red-500 text-[.7rem]">{errors.email.message}</span>) : "Email"}</Label>
                                <Input type="email" placeholder="Enter your email..." id="email"
                                {...register("email", {
                                    required:{value:true, message:"Please enter your email"},
                                    pattern: {value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, message: "Please enter a valid email"}
                                })}/>
                            </div>
                            <div className="flex flex-col space-y-2 mb-5">
                                <Label htmlFor="password" className="text-base font-semibold ml-2">{errors.password ? (<span className="text-red-500 text-[.7rem]">{errors.password.message}</span>) : "Password"}</Label>
                                <Input type="password" placeholder="Enter your password..." id="password"
                                {...register("password", {
                                    required:{value:true, message:"Please enter your password"},
                                    pattern: {value: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/gm, message: "Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number and a special charater"}
                                })}
                                />
                            </div>
                            <div className="flex flex-col space-y-2 mb-2">
                                <Label htmlFor="avatar" className="text-base font-semibold ml-2">{errors.avatar ? (<span className="text-red-500 text-[.7rem]">{errors.avatar.message}</span>) : "Avatar"}</Label>
                                <Input type="file" id="avatar"
                                {...register("avatar",{
                                    required:{value:true, message:"Please provide an avatar"}
                                })}
                                />
                            </div>
                            <div className="flex flex-col space-y-2 mb-2">
                                <Label htmlFor="coverImage" className="text-base font-semibold ml-2">{errors.coverImage ? (<span className="text-red-500 text-[.7rem]">{errors.coverImage.message}</span>) : "coverImage"}</Label>
                                <Input type="file" id="coverImage" 
                                {...register("coverImage",{
                                    required:{value:true, message:"Please provide a cover image"}
                                })}
                                />
                            </div>
                            <div>
                                <p className="text-[.8rem]">Already a member, Get logged in to  <Link to={'/login'} className="text-purple-600 font-semibold dark:text-purple-400">Social .</Link></p>
                            </div>
                        </CardContent>
                    </div>
                    <CardFooter className="flex justify-evenly">
                        <Button type="submit" variant={'default'} >
                            {isLoading 
                                ? (
                                    <>
                                        <ColorRing height="22" width="22" />
                                        <span className="ml-2">Signup</span>
                                    </>
                                    ) 
                                : "Signup"
                            }
                        </Button>
                        <Button type="reset" variant={'outline'}>Reset</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    </>
  )

}
export {Signup}