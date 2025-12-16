import mongoose from 'mongoose';

const commentsSchema=new mongoose.Schema({
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Posts',
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    commentText:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
});

const Comments=mongoose.model('Comments',commentsSchema);
export default Comments;