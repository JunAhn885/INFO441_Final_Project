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

  let userInfo = {};
  if(await Database.get(`/orgs/${req.body.orgId}/due`)){
    userInfo = {
      tags: {
        _unverified: true
      },
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

// Delete a member from database
router.delete("/member", async (req, res) => {
  await Database.remove(`/orgs/${req.body.orgId}/members/${req.body.member}`);
  res.json({});
});

/**
 * POST to add an officer
 */
router.post("/officer", async (req, res) => {
  if (!req.body.officerId) {
    throw new ApiError("Must specify a current member's ID.");
  }

  await Database.set(`/orgs/${req.body.orgId}/members/${req.body.officerId}/tags/_owner`, true);
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

  let members = await Database.get(`/orgs/${req.body.org}/members`);
  for (const [id] of Object.entries(members)) {
    Database.set(`/orgs/${req.body.org}/members/${id}/tags/_unverified`, true)
  }

  res.json({due});
});

/**
 * DELETE due from user.
 */
router.delete("/dues", async (req, res) => {
  await Database.remove(`/orgs/${req.body.orgId}/members/${req.body.memberId}/tags/_unverified`);
  await Database.set(`/orgs/${req.body.orgId}/members/${req.body.memberId}/tags/_verified`, true);
  res.json({});
});

/**
 * DELETE Org.
 */
router.delete("/delete", async (req, res) => {
  await Database.remove("/orgs/" + req.body.org);
  res.json({});
});

export default router;
