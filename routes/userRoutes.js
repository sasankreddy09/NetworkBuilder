import Router from 'express';
import {fileUpload, register,userUpdate,getUserAndProfile,getAllProfiles, downloadProfile, sendConnectionRequest, getMyConnections, whatAreMyConnections, acceptConnectionRequest} from "../controllers/userController.js"
import {login} from "../controllers/userController.js"
import multer from 'multer';
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname);
    }
});
const upload=multer({storage:storage});
const router=Router();
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/upload').post(upload.single('file'),fileUpload);
router.route("/user_update").post(userUpdate);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/get_all_users").get(getAllProfiles);
router.route("/download_resume").get(downloadProfile);
router.route("/send_connection_request").post(sendConnectionRequest);
router.route("/get_connection_requests").get(getMyConnections);
router.route("/user_connection_requests").get(whatAreMyConnections);
router.route("/accept_connection_request").post(acceptConnectionRequest);
export default router;