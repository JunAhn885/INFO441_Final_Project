"use strict";

import express from "express";

import { ApiError, Database } from "../utils.js";

const router = express.Router();

/**
 * GET joined organizations.
*/
router.get("/:id?", async (req, res) => {
  if (req.params.id) {
    let org = {};

    const orgPath = `/orgs/${req.params.id}`;
    org = await Database.get(orgPath);

    res.json(org);
  } else {
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
  };
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

/**
 * POST to add a member to org
 */
 router.post("/member", async (req, res) => {
  if (!req.body.name) {
    throw new ApiError("Must specify a name for the new member.");
  }
  if (!req.body.email) {
    throw new ApiError("Must specify a email for the new member.");
  }
  const now = new Date().toISOString();

  const user = {
    name: req.body.name,
    email: req.body.email
  };
  const id = await Database.insert("/users", user);
  
  const userInfo = {};
  if(await Database.get(`/orgs/${req.body.orgId}/due`)){
    userInfo = {
      tags: _unverified,
      timeJoined: now
    };
  } else {
    userInfo = {
      timeJoined: now
    };
  }

  await Database.set(`/orgs/${req.body.orgId}/members/${id}`, userInfo);

  res.json({
    ...userInfo
  });
});

/**
 * POST to add an officer
 */
router.post("/officer", async (req, res) => {
  if (!req.body.id) {
    throw new ApiError("Must specify a current member's ID.");
  }

  await Database.set(`/orgs/${req.body.org}/members/${req.body.id}/tags`, {_owner: true});
  res.json({_owner: true});
});

/**
 * POST to change dues.
 */
router.post("/dues", async (req, res) => {
  if (!req.body.amount) {
    throw new ApiError("Must specify a due amount.");
  }

  const due = {
    amount: req.body.amount
  };

  const id = await Database.set(`/orgs/${req.body.org}/due`, due);
  res.json({due});
});

router.delete("/delete", async (req, res) => {
  await Database.remove("/orgs/" + req.body.org);
  res.json({});
});

export default router;
