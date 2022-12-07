"use strict";

import express from "express";

import { signInWithRedirect } from "../../app.js";
import { ApiError, getTestUser, getUser, Database, Tags } from "../api/utils.js";

/**
 * Catch-all middleware that runs first to check if the user is logged in.
 * If the user is not logged in, they are redirected to Azure then back.
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
  
  signInWithRedirect(req.originalUrl)(req, res, next);
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

router.get("/checkin/:key", async (req, res) => {
  let orgId;
  let eventId;

  // Try to find the event with that key, will have to do it manually
  const orgs = await Database.get("/orgs");
  for (const [orgId_, org] of Object.entries(orgs)) {
    if (!org.events) {
      // Org has no events
      continue;
    }

    for (const [eventId_, event] of Object.entries(org.events)) {
      if (event.key === req.params.key) {
        // Found the given event
        orgId = orgId_;
        eventId = eventId_;
        break;
      }
    }

    if (eventId) {
      // Already found
      break;
    }
  }

  if (!eventId) {
    throw new ApiError("Invalid event check-in key.");
  }

  // Add the user to the organization if not already
  if (!await Database.hasTag(orgId, req.user.id)) {
    const userInfo = { timeJoined: new Date().toISOString() };

    if (await Database.get(`/orgs/${orgId}/due`)) {
      // Club has dues, default to unverified
      userInfo["tags"] = {
        _unverified: true
      };
    }
  
    await Database.set(`/orgs/${orgId}/members/${req.user.id}`, userInfo);
  }

  // Are they already checked in?
  if (await Database.exists(
      `/orgs/${orgId}/events/${eventId}/attendances/${req.user.id}`)) {
    res.json({ "message": "You are already checked in." });
    return;
  }

  // Are they late?
  const end = await Database.get(
    `/orgs/${orgId}/events/${eventId}/timeNotAfter`
  );
  if (new Date() > new Date(end)) {
    throw new ApiError("Check-in cutoff has passed for this event.");
  }

  // Check them in
  await Database.set(
    `/orgs/${orgId}/events/${eventId}/attendances/${req.user.id}`,
    new Date().toISOString()
  );

  res.json({ "message": "Check-in successful." });
});

router.use(onApiError);

export default router;
