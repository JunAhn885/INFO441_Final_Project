"use strict";

import express from "express";
import { getDatabase, ref, set } from "firebase/database";
import { Database } from "../utils.js";

const router = express.Router();

/**
 * GET the authenticated user.
 */
router.get("/", async (req, res) => {
  // Get the user
  const userPath = `/users/${req.user.id}`;
  let user = await Database.get(userPath);
  if (!user) {
    // Our first time seeing this user, save their info
    user = {
      name: req.user.name,
      email: req.user.email
    };

    await Database.set(userPath, user);
  }

  res.json(user);
});

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
