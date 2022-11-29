"use strict";

import express from "express";

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

export default router;
