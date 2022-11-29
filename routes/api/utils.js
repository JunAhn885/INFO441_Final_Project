"use strict";

/**
 * An API error to be returned to the user.
 */
export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Identifying information of an API user.
 */
class ApiUser {
  /**
   * User's account ID as provided by Azure.
   */
  id;
  /**
   * User's email address.
   */
  email;

  /**
   * User's full name.
   */
  name;

  constructor(id, email, name) {
    this.id = id;
    this.email = email;
    this.name = name;
  }
}

/**
 * Gets the authenticated user from Express request object.
 * @param {express.Request} req Express request object.
 * @returns An `ApiUser` object, or `null` if the user is not authenticated.
 */
export function getUser(req) {
  if (!req.session.isAuthenticated) {
    // User is not authenticated
    return null;
  }

  return new ApiUser(
    req.session.account.homeAccountId,
    req.session.account.username,
    req.session.account.name
  );
}
