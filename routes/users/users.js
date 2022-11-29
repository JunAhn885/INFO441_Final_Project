import express from 'express';
import { getDatabase, ref, set } from "firebase/database";
var router = express.Router();

router.get('/myIdentity', function(req, res, next) {
  if(req.session.isAuthenticated){
    const db = getDatabase();
    set(ref(db, 'users/' + req.session.account.localAccountId), {
      email: req.session.account.username,
      name: req.session.account.name
    });
    res.json(
        {
            status: "loggedin", 
            userInfo: {
                name: req.session.account.name,
                username: req.session.account.username
            }
        }
    );
  } else {
    res.json(
      { 
        status: "loggedout" 
      }
    );
  }
});

export default router;
