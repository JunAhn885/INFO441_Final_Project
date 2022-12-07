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

router.post("/:orgId", async (req, res) => {
  if (!await Database.hasTag(req.params.orgId, req.user.id, Tags.Owner)) {
    throw new ApiError(
      "Not authorized to create events in the given organization."
    );
  }

  if (!req.body.name) {
    throw new ApiError("Must specify a name for the new event.");
  }

  const timeNotBefore = new Date(req.body.timeNotBefore);
  if (!isFinite(timeNotBefore)) {
    throw new ApiError("Invalid start date time.")
  }

  const timeNotAfter = new Date(req.body.timeNotAfter);
  if (!isFinite(timeNotAfter)) {
    throw new ApiError("Invalid end date time.");
  }

  const event = {
    creator: req.user.id,
    name: req.body.name,
    timeNotBefore: timeNotBefore.toISOString(),
    timeNotAfter: timeNotAfter.toISOString(),
    key: crypto.randomBytes(8).toString("hex")
  };

  const id = await Database.insert(`/orgs/${req.params.orgId}/events`, event);
  res.json({
    id: id,
    ...event
  });
});

export default router;
