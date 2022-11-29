"use strict";

import { get, getDatabase, push, ref, remove, set } from "firebase/database";

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
 * Returns a test user.
 * @returns A test user.
 */
export function getTestUser() {
  return new ApiUser(
    "12345678-1234-5678-1234-567812345678",
    "user@example.com",
    "Expresso Nodeman"
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
   * Inserts a new value in the given list in Firebase Realtime Database.
   * @param {string} path Path to the list to insert in the database.
   * @param {object} value New value to insert into the given list.
   * @returns Key of the newly inserted value.
   */
  static async insert(path, value) {
    const listRef = ref(getDatabase(), path);
    const newRef = await push(listRef, value);
    return newRef.key;
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
