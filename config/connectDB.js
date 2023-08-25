import mongoose from "mongoose";

const connectDB = async (CONNECT_URL) => {
    try {
        await mongoose.connect(CONNECT_URL)
        console.log("Connected Succesfully")
    } catch (e) {
        console.log(e)

    }
}

export default connectDB