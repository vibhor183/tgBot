import mongoose from "mongoose";

export default () => {
    return mongoose.connect("mongodb+srv://vanshsharma7748:vansh9927@cluster0.ixune.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
        connectTimeoutMS: 30000,  // 30 seconds
        socketTimeoutMS: 45000,   // 45 seconds
        retryWrites: true
    });
};
