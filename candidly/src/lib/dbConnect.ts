
import mongoose from "mongoose";

// we may or may not get number that's why '?'
// sometimes we may get string also
type ConnectionObject = {
    isConnected? : number
}

const connection: ConnectionObject ={}

// here void means it is optional
async function dbConnect() : Promise<void> {

    if(connection.isConnected){
        console.log("DB Already Connected");
        return
    }else{
        try {
            const db = await mongoose.connect(process.env.MONGODB_URI || '' , {})

            connection.isConnected = db.connections[0].readyState
            console.log("DB Connected Successfully");

        } catch (error) {
            console.log("DB connection failed", error)
            process.exit(1)
        }
    }
}

export default dbConnect