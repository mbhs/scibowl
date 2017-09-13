const validator = require("validator");


/** Verify a username falls within a set of constraints. */
function username(username) {
  if (validator.isEmpty(username)) throw "Username cannot be empty";
  if (!validator.isAscii(username)) throw "Username must consist of ASCII characters";
  if (!validator.isAlphanumeric(username)) throw "Username must be alphanumeric";
  return username;
}
