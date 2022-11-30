"use strict";

import express from "express";

import { ApiError, Database } from "../utils.js";

const router = express.Router();

/**
 * GET joined organizations.
 */
router.get("/", async (req, res) => {
  const allOrgs = await Database.get("/orgs");
  const joinedOrgs = [];

  // Only return orgs that the user is a part of
  for (const [id, org] of Object.entries(allOrgs)) {
    if ("members" in org && req.user.id in org.members) {
      // User is part of the org
      joinedOrgs.push({
        id: id,
        ...org
      });
    }
  }

  res.json(joinedOrgs);
});

/**
 * POST to create an organization.
 */
router.post("/", async (req, res) => {
  if (!req.body.name) {
    throw new ApiError("Must specify a name for the new organization.");
  }
  const now = new Date().toISOString();
  const org = {
    name: req.body.name,
    owner: req.user.id,
    members: {
      [req.user.id]: {
        timeJoined: now,
        tags: {
          _owner: true
        }
      }
    }
  };

  const id = await Database.insert("/orgs", org);
  res.json({
    id: id,
    ...org
  });
});

export default router;
