"use strict";

import express from "express";

import userController from "./controllers/users.js";
import { ApiError, getTestUser, getUser } from "./utils.js";

/**
 * Catch-all middleware that runs first to check if the user is logged in.
 * If the user is not logged in, they receive an error message.
 */
function onApiRequest(req, res, next) {
  if (req.session.isAuthenticated) {
    // Inject API user object
    req.user = getUser(req);
    next();
    return;
  } else if (process.env.DEBUG) {
    // Check for debug API key
    if (req.header("X-API-Key") === process.env.SESSION_SECRET) {
      // Inject test user
      req.user = getTestUser();
      next();
      return;
  }
  }

  throw new ApiError("Please log in to use this feature.");
}

/**
 * Catch-all error handler for the entire API controller.
 * All errors are logged to console.
 * API errors are returned to the user, while internal errors are replaced with
 * a generic error message.
 */
function onApiError(err, req, res, next) {
  console.error(`${err.name}: ${err.message}`);
  console.error(err.stack);
  if (err instanceof ApiError) {
    res.status(400).json({
      error: err.message
    });
  } else {
    res.status(500).json({
      error: "An internal error occured."
    });
  }
}

const router = express.Router();

router.use(onApiRequest);

router.use("/user", userController);

router.use(onApiError);

export default router;
