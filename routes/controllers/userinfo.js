import express from 'express';
import { getDatabase, ref, onValue } from "firebase/database";
const dbRef = ref(getDatabase());

var router = express.Router();

router.get('/', async (req, res, next) => {
    try{
        if(req.session.isAuthenticated) {
            let userInfo = 
            res.json(userInfo);
        } else {
            let result = {
              status: "error",
              error: "not logged in"
            }
            res.status(401).json(result);
        }
    } catch(e) {
        res.status(500).json({"status": "error", "error": e});
    }
});

export default router;