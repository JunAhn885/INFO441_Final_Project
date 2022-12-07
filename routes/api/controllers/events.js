"use strict";

import crypto from "node:crypto";

import express from "express";

import { ApiError, Database, Tags } from "../utils.js";

const router = express.Router();

/**
 * GET events of the given organization.
 */
router.get("/:orgId", async (req, res) => {
  if (!await Database.hasTag(req.params.orgId, req.user.id)) {
    throw new ApiError("Not part of the given organization.");
  }

  let result = [];
  const events = await Database.get(`/orgs/${req.params.orgId}/events`);
  if (events) {
    for (const [id, event] of Object.entries(events)) {
      result.push({
        id: id,
        ...event
      });
    }
  }

  res.json(result);
});

export default router;
