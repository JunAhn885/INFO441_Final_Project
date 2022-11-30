"use strict";

import express from "express";
import { ApiError, Database } from "../utils.js";

const router = express.Router();

/**
 * GET the authenticated user, or
 * GET a user with the given ID.
 */
router.get("/:id?", async (req, res) => {
  let user = {};

  if (req.params.id) {
    // Get another user
    const userPath = `/users/${req.params.id}`;
    user = await Database.get(userPath);
    if (!user) {
      throw new ApiError("Invalid user ID.");
    }

    user.id = req.params.id;
  } else {
    // Get the authenticated user
    const userPath = `/users/${req.user.id}`;
    user = await Database.get(userPath);
    if (!user) {
      // Our first time seeing this user, save their info
      user = {
        name: req.user.name,
        email: req.user.email
      };

      await Database.set(userPath, user);
      user.id = req.user.id;
    }

    user.id = req.user.id;
  }

  res.json(user);
});

// router.post("/join?", async (req, res){
//   let user = {};
//   user = await Database.get(userPath);
// });

export default router;
