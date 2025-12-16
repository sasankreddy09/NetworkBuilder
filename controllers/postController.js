import Posts from "../models/postsModel.js";
import Users from "../models/userModel.js";
import Comments from "../models/commentsModel.js";
export const createPost=async (req,res)=>{
    try{
        console.log("hello");
        const {token}=req.body;
        const user=await Users.findOne({token:token});
        if(!user) return res.status(400).json({message:"user not found"});
        const post = new Posts({
            userId:user._id,
            body:req.body.body,
            media:req.file != undefined ? req.file.path:"",
            fileType:req.file != undefined ? req.file.mimetype.split("/")[1]:""
        })
        post.save().then(()=>res.status(200).json({message:"post is created successful"}));
    }catch(err){
        return res.status(500).json({error:err.message});
    }
}
export const getAllPosts=async (req,res)=>{
    try{
        const posts=await Posts.find().populate("name username email profilePicture");
        return res.status(200).json({posts});
    }catch(err){
        return res.status(500).json({error:err.message})
    }
}
export const deletePost = async (req,res)=>{
    try{
        const {token,postId}=req.body;
        const user=await Users.findOne({token:token}).select("_id");
        if(!user)return res.status(400).json({message:"user not found"});
        const post=await Posts.findById(postId);
        if(!post) return res.status(400).json({message:"post not found"});
        if(post.userId.toString() !== user.toString()){
            return res.status(401).json({message:"unauthorized"});
        }
        await Posts.deleteOne({_id:postId});
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
}
export const commentPost = async (req,res)=>{
    try{
        const {token,postId,comment}=req.body;
        const user=await Users.findOne({token:token});
        if(!user)return res.status(400).json({error:"user not found"});
        const post=await Posts.findById(postId);
        if(!post)return res.status(400).json({error:"posts not found"});
        const comments=new Comments({
            userId:user._id,
            postId:post._id,
            comment:comment
        });
        await comments.save();
        return res.status(200).json({message:"the comment is added successfully"});
    }catch(err){
        return res.status(500).json({error:err.message});
    }
}
export const getCommentsByPost = async(req,res)=>{
    try{
        const {postId} = req.body;
        const post=await Posts.findById(postId).populate("comments");
        if(!post)return res.status(400).json({message:"post not found"});
        return res.status(200).json({comments:post.comments})
    }catch(err){
        return res.status(500).json({error:err.message});
    }
}
export const deleteCommentOfUser = async (req,res)=>{
    try{
        const {token,commentId} = req.body;
        const user=await Users.findOne({token:token});
        if(!user)return res.status(400).json({message:"user not found"});
        const Comment = await Comments.findById(commentId);
        if(!Comment)return res.status(400).json({message:"Comment not found"});
        if(Comment.userId.toString()!==user._id.toString()){
            return res.status(400).json({message:"you are not owner of this comment"});
        }
        await Comments.deleteOne({"_id":commentId});
        return res.status(200).json({message:"comment deleted successfully"});
    }catch(err){
        return res.status(500).json({error:err.message});
    }
}
export const incrementLikes= async (req,res)=>{
    try{
        const {postId}=req.body;
        const posts=await Posts.findById(postId);
        if(!posts)return res.status(500).json({message:"post is not found"});
        posts.likes+=1;
        await posts.save();
        return res.status(200).json({message:"the likes are incremented successfully"});
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
}