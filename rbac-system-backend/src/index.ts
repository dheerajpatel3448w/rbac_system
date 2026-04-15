import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
import { connectDb } from "./config/db.js";


connectDb().then(async()=>{

  
    app.listen(process.env.PORT, () => {
  console.log("rbac_system is running on port " + process.env.PORT);
});
}).catch((error:any)=>{
    console.error("Failed to connect to the database:", error);
});