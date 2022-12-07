"use strict";

import crypto from "node:crypto";

import express from "express";

import { ApiError, Database } from "../utils.js";

const router = express.Router();

/**
 * GET joined orgs, or the org with the given ID.
*/
router.get("/:id?", async (req, res) => {
  if (req.params.id) {
    // Get org with ID
    const orgPath = `/orgs/${req.params.id}`;
    const org = await Database.get(orgPath);
    if (!org) {
      throw new ApiError("The given org ID does not exist.");
    }

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
          // Creator is owner
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
 * POST to add an existing or new user to the org with the given ID.
 */
router.post("/member", async (req, res) => {
  if (!req.body.email) {
    throw new ApiError("Must specify the email of the new member.");
  }

  const userInfo = {
    timeJoined: new Date().toISOString()
  };

  // Try to find an existing member
  let memberId;
  const emailUser = await Database.getByChildValue(
    "/users", "email", req.body.email
  );
  if (emailUser) {
    // Found existing user with given email, add as member
    memberId = Object.keys(emailUser)[0];
  } else {
    // Create a new user with a temporary ID based on their email
    const hash = crypto.createHash("sha256");
    hash.update(req.body.email);
    memberId = hash.digest("hex");
    await Database.set(`/users/${memberId}`, {
      email: req.body.email
    });
  }

  if (await Database.get(`/orgs/${req.body.orgId}/due`)) {
    // Club has dues, default to unverified
    userInfo["tags"] = {
      _unverified: true
    };
  }

  await Database.set(`/orgs/${req.body.orgId}/members/${memberId}`, userInfo);

  res.json({
    id: memberId,
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
