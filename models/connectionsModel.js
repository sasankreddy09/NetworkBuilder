import mongoose from "mongoose";
const connectionsSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    connectionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    status_accepted:{
        type:Boolean,
        default:null,
    }
});
const Connections=mongoose.model('Connections',connectionsSchema);
export default Connections;