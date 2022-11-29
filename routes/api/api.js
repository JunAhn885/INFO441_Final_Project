"use strict";

import express from "express";

import userController from "./controllers/user.js";
import { ApiError } from "./utils.js";

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

router.use("/user", userController);

router.use(onApiError);

export default router;
