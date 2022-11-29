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
