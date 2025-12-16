import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Profile from "../models/profileModel.js";
import PDFDocument from "pdfkit";
import Connections from "../models/connectionsModel.js"
import fs from "fs";
async function convertUserDataToPDF(userData){
    const doc=new PDFDocument();
    // console.log(userData);
    const outputPath= crypto.randomBytes(32).toString("hex")+".pdf";
    const stream=fs.createWriteStream(outputPath);
    doc.pipe(stream);
    doc.fontSize(25).text("User Profile",{align:"center"});
    doc.moveDown();
    doc.image(`uploads/${userData.userId.profilePicture}`,{align:"center",width:50});
    doc.moveDown();
    doc.fontSize(16).text(`Name: ${userData.userId.name}`);
    doc.moveDown();
    doc.fontSize(16).text(`Username: ${userData.userId.username}`);
    doc.moveDown();
    doc.fontSize(16).text(`Email: ${userData.userId.email}`);
    doc.moveDown();
    doc.fontSize(16).text(`Bio: ${userData.bio || "N/A"}`);
    doc.moveDown();
    doc.fontSize(16).text(`Location: ${userData.location || "N/A"}`);
    doc.moveDown();
    doc.fontSize(16).text(`pastWork: `);
    doc.moveDown();
    userData.pastWork.forEach((work,index)=>{   
        doc.fontSize(14).text(`company name: ${work.companyName || "N/A"}`);
        doc.fontSize(14).text(`role: ${work.role || "N/A"}`);
        doc.fontSize(14).text(`duration: ${work.duration || "N/A"}`);
        doc.moveDown();
    });
    doc.fontSize(16).text(`education: `);
    doc.moveDown();
    userData.education.forEach((edu,index)=>{
        doc.fontSize(14).text(`institution name: ${edu.institutionName || "N/A"}`);
        doc.fontSize(14).text(`degree: ${edu.degree || "N/A"}`);
        doc.fontSize(14).text(`yearOfCompletion: ${edu.yearOfCompletion || "N/A"}`);    
        doc.moveDown();
    });
    doc.end();
    return outputPath;
}
export const register=async (req,res)=>{
    try{
        const {name,email,username,password}=req.body;
        const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      } else if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await new User({
            name,
            email,
            password:hashedPassword,
            username
        }).save();
        const profile=new Profile({userId : user._id});
        await profile.save();
        return res.json({message:"user created successfully"});
    }
    catch(err){
        return res.status(404).json({error:`${err}`});
    }
}
export const login=async (req,res)=>{
    try{
        console.log("login called");
        const {username,password}=req.body;
        console.log(username,password);
    if(!username||!password){return res.status(400).json({message:"All fields are required"})};
    const user=await User.findOne({username});
    if(!user){return res.json({message:"please register first"})};
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({message:"invalid credentials"});
    }
    const token=crypto.randomBytes(32).toString("hex");
    await User.updateOne({_id: user._id}, { token });
    return res.status(200).json({token:`The token ${token} is generated successfully`});
    }
    catch(err){
        return res.status(500).json({error:"There is a error occured"});
    }

}
export const fileUpload=async (req,res)=>{
    try{
        const {token}=req.body;
        const user=await User.findOne({token: token});
        if(!user){
            return res.status(400).json({error:"There is no such user"});
        }
        user.profilePicture=req.file.filename;
        user.save();
    }
    catch(err){
        return res.status(500).json({error:"There is a error occured"});
    }     
}
export const userUpdate=async (req,res)=>{
    try{
        const { token, username, email, ...otherDetails } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(400).json({ message: "There is no such user" });
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser && String(existingUser._id) !== String(user._id)) {
            return res.status(400).json({ message: "User already exists" });
        }

        Object.assign(user, { username, email, ...otherDetails });
        await user.save();

        return res.status(200).json({ message: "User updated successfully" });
            
                
    }
    catch(err){
        return res.status(500).json({error:"There is a server error occured"});
    }
}
export const getUserAndProfile=async (req,res)=>{
    try{
        const {token}=req.body;
        console.log(token);
        const user=await User.findOne({token:token});
        if(!user)return res.status(400).json({error:"User doesnt exists"});
        const userProfile=await Profile.findOne({userId:user._id}).populate('userId','name email username profilePicture')
        return res.json(userProfile);
    }
    catch(err){
        return res.status(500).json({error:"There is a server error occured"});
    }
}
export const updateProfile =async (req,res)=>{
    try{
        const { token, ...profileDetails} = req.body;
        const user = await User.findOne({ token });             
        if (!user) {
            return res.status(400).json({ message: "There is no such user" });
        }
        const userProfile = await Profile.findOne({ userId: user._id });            
        if (!userProfile) {
            return res.status(400).json({ message: "Profile not found" });
        }
        Object.assign(userProfile, profileDetails);
        await userProfile.save();
        return res.status(200).json({ message: "Profile updated successfully" });
    }
    catch(err){
        return res.status(500).json({error:"There is a server error occured"});
    }
}
export const getAllProfiles=async (req,res)=>{
    try{
        const profiles=await Profile.find().populate('userId','name email username profilePicture');
        return res.json(profiles);
    }
    catch(err){
        return res.status(500).json({error:"There is a server error occured"});
    }
}
export const downloadProfile = async(req,res)=>{
    try{
        const user_id=req.query.id;
        // console.log(req.query.id);
        const user=await User.findById(user_id);
        // console.log(user);
        if(!user)return res.status(400).json("user doesnt exists");
        const user_profile=await Profile.findOne({userId:user_id}).populate("userId",'name username email profilePicture');
        console.log(user_profile);
        let a =await convertUserDataToPDF(user_profile);
        return res.json(a);
    }
    catch(err){
        // console.log(err);
        return res.status(500).json({error:"There is a server error occured"});
    }
}
export const sendConnectionRequest = async(req,res)=>{
    try{
        const {token,connectionId}=req.body;
        const user=await User.findOne({token:token});
        if(!user)return res.status(400).json({message:"user not found"});
        const connectionUser=await User.findById(connectionId);
        if(!connectionUser)return res.status(400).json({message:"The reciepent is not found"});
        let connections=await Connections.findOne({userId:user._id,connectionId:connectionId});
        if(connections)return res.status(400).json({message:"connection request already sent"});
        const request=new Connections({
            userId:user._id,
            connectionId:connectionId
        })
        request.save().then(()=>{res.status(200).json({message:"The connection sent successfully"})})
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
}
export const getMyConnections =async (req,res)=>{
    try{
        const {token}=req.body;
        const user=await User.findOne({token:token});
        if(!user)return res.status(400).json({message:"The user is not found"});
        const connections=await Connections.findOne({userId:user._id});
        return res.status(400).json({message:connections});
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
}
export const whatAreMyConnections=async (req,res)=>{
    try{
        const {token}=req.body;
        const user=await User.findOne({token:token});
        if(!user)return res.status(400).json({message:"The user is not found"});
        const connections=await Connections.findOne({connectionId:user._id}).populate("userId",'name username email profilePicture');
        return res.status(400).json({message:connections});
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
}
export const acceptConnectionRequest = async (req,res)=>{
    try{
        const {token,requestId,action_type}=req.body;
        const user=await user.findOne({token:token});
        if(!user)return res.status(400).json({message:"user not found"});
        const connection=await Connections.findById(requestId);
        if(action_type=== "accept"){
            connection.status_accepted=true;
        }
        else{
            connection.status_accepted=false;
        }
        connection.save().then(()=>{return res.status(200).json({message:"Request updated"})});
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
}