"use strict";

import express from "express";

import { ApiError } from "../utils.js";

const router = express.Router();

router.get("/", async (req, res) => {
  throw new ApiError("This is a custom error.");
});

export default router;
