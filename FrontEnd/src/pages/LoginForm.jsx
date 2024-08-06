import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useNavigate,Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { ErrorComp } from "@/components/ErrorComp"
import { ColorRing } from "react-loader-spinner"
import { useGetLoggedInMutation } from "@/store/api/apiSlice"

function LoginForm() {
    const [login,{isSuccess, isLoading, isError, error}] = useGetLoggedInMutation()
    const navigate = useNavigate()

    const {register, handleSubmit, formState: {errors}} = useForm()

    useEffect(() => {
        if (isSuccess) {
        navigate('/')
        }
    },[navigate,isSuccess])

    const onSumbit = async (data) => {
        // const formData = new FormData();
        // formData.set("email", data.email);
        // formData.set("password", data.password);
        
        try {
            await login({
                email: data.email,
                password: data.password
            }).unwrap()
        } catch (error) {
            console.error(error);
        }
    }

  return (
    <>
        <div className='grid place-items-center mt-8'>
            <Card className="w-[350px] max-h-[500px]">
                <CardHeader className="mt-3">
                    <CardTitle className="text-3xl">Login</CardTitle>
                    <CardDescription className="text-purple-600 text-[.9rem] font-semibold">Get Logged into Social.</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSumbit)}>
                    <div>
                        <CardContent>
                            {isError && 
                            <ErrorComp
                            className="mb-3 p-3 transition-all"
                            title="Error" 
                            description={error} 
                            icon="destructive" 
                            alertVariant="destructive"/>
                            }
                            {isSuccess && 
                                <ErrorComp 
                                className="mb-3 p-3 transition-all"
                                title="Logged In" 
                                description="Logged In successfully" 
                                icon="success" 
                                alertVariant="success" />
                            }
                            <div className="flex flex-col space-y-2 mb-5">
                                <Label htmlFor="name" className="text-base font-semibold ml-2" >{errors.email ? (<span className="text-red-500">{errors.email.message}</span>) : "Email or Username"}</Label>
                                <Input type="email" placeholder="Enter your email..." id="name" 
                                {...register("email", {
                                        required: "Please enter a valid email",
                                        pattern: {value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, message: "Please enter a valid email"}
                                    })}
                                />
                            </div>
                            <div className="flex flex-col space-y-2 mb-5">
                                <Label htmlFor="password" className="text-base font-semibold ml-2">{errors.password ? (<span className="text-red-500">{errors.password.message}</span>) : "Password"}</Label>
                                <Input type="password" placeholder="Enter your password..."
                                {...register("password", {
                                    required: "Please enter your password",
                                })}
                                />
                            </div>
                            <div>
                                <p className="text-[.8rem]">Are&#39;nt a member, Be a member of <Link to={'/signup'} className="text-purple-600 font-semibold dark:text-purple-400">Social .</Link></p>
                            </div>
                        </CardContent>
                    </div>
                    <CardFooter className="flex justify-evenly">
                        <Button type="submit" variant={'default'}  disabled={isLoading}>
                        {isLoading 
                            ? (
                                <>
                                    <ColorRing height="22" width="22" />
                                    <span className="ml-2">Login</span>
                                </>
                                ) 
                            : "Login"}
                        </Button>
                        <Button type="reset" variant={'outline'}>Reset</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    </>
  )
}

export {LoginForm}