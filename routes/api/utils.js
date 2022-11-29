"use strict";

import { get, getDatabase, ref, remove, set } from "firebase/database";

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

  /**
   * Could have used homeAccountId but it includes a dot, which we can't use in
   * Firebase keys.
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
   */
  return new ApiUser(
    req.session.account.localAccountId,
    req.session.account.username,
    req.session.account.name
  );
}

/**
 * Utility functions for Firebase Realtime Database.
 */
export class Database {
  /**
   * Gets the value at the given path from Firebase Realtime Database.
   * @param {string} path Path to the value to get from the database.
   * @returns The object, or `null` if one is not found.
   */
  static async get(path) {
    const reference = ref(getDatabase(), path);
    const snapshot = await get(reference);
    return snapshot.val();
  }

  /**
   * Sets the value at the given path in Firebase Realtime Database.
   * @param {string} path Path to the value to overwrite in the database.
   * @param {object} value New value for the given path.
   */
  static async set(path, value) {
    const reference = ref(getDatabase(), path);
    await set(reference, value);
  }

  /**
   * Removes the value at the given path from Firebase Realtime Database.
   * @param {string} path Path to the value to remove from the database.
   */
  static async remove(path) {
    const reference = ref(getDatabase(), path);
    await remove(reference);
  }
}
