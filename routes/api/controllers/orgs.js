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
 * POST to add a member
 */
router.post("/addMember", async (req, res) => {
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
  const id = await Database.insert(`/users`, user);

  const userInfo = {
    tags: member,
    timeJoined: now
  };

  const member = {
    id: id,
    ...userInfo
  };
  const id2 = await Database.insert(`/${req.body.org}/members`, member);

  res.json({
    id: id,
    ...userInfo
  });
});



/**
 * POST to add an officer
 */
router.post("/addOfficer", async (req, res) => {
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
 * POST to change dues.
 */
router.post("/dues", async (req, res) => {
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
