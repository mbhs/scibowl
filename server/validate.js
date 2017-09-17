const validator = require('validator');


class Error { constructor(reason) { this.reason = reason; } }


/** Verify a username falls within a set of constraints. */
module.exports.username = function(username) {
  if (!username instanceof String || validator.isEmpty(username)) throw new Error("Username cannot be empty");
  if (!validator.isAscii(username)) throw new Error("Username must consist of ASCII characters");
  if (!validator.isAlphanumeric(username)) throw new Error("Username must be alphanumeric");
  return username;
};


/** Validate a string is not empty. */
module.exports.password = function(password) {
  if (!password instanceof String || validator.isEmpty(password)) throw new Error("Password cannot be empty");
  return password;
};


/** Validate a name. */
module.exports.name = function(name) {
  if (!name instanceof String || validator.isEmpty(name)) throw new Error("Password cannot be empty");
  return name;
};


/** Validate an email. */
module.exports.email = function(email) {
  if (!email instanceof String || !validator.isEmail(email)) throw new Error("Must be valid email");
  return email;
};

module.exports.year = function(year) {
  if (!year instanceof Number) throw new Error("Must be numeric");
  return year;
};

module.exports.Error = Error;
