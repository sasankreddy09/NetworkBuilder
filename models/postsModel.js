import mongoose from "mongoose";
const postsSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    body:{
        type:String,
        required:true,
    },
    likes:{
        type:Number,
        default:0,
    },
    updatedAt:{
        type:Date,      
        default:Date.now,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }, 
    media:{
        type:String,    
        default:"",
    },
    active:{
        type:Boolean,
        default:true,
    },
    fileType:{
        type:String,
        default:"",
    },
    comments:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comments',
    }
});
const Posts=mongoose.model('Posts',postsSchema);
export default Posts;