import dotenv from "dotenv"
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running at port ${process.env.PORT}`)
    })
    app.on("error", (err) => {
        console.log("Error in on ",err)
        throw err
    })
})
.catch((err) => (
    console.log("MONOGODB Connnect FAILED !!!",err)
))