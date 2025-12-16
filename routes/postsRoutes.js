import multer from "multer";
import Router from "express";
import {commentPost, createPost, deleteCommentOfUser, deletePost, getAllPosts, getCommentsByPost, incrementLikes} from "../controllers/postController.js";
const router=Router();

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname);
    }
});
const upload=multer({storage:storage});
router.route("/create_post").post(upload.single('file'),createPost);
router.route("/get_all_posts").get(getAllPosts);
router.route("/delete_post").post(deletePost);
router.route("/comment_post").post(commentPost);
router.route("/get_comments_by_post").get(getCommentsByPost);
router.route("/delete_comment_of_user").post(deleteCommentOfUser);
router.route("/increment_likes").post(incrementLikes);

export default router;