models = require('../models');

/** Check the user role. */
function assertUserRole(role) {
  return function(req, res, next) {
    if (req.user && req.user.role >= role) next();
    else res.status(401).send();
  };
}

module.exports.assertUserRole = assertUserRole;
module.exports.assertUserAuthenticated = assertUserRole(models.roles.public);
module.exports.assertStudent = assertUserRole(models.roles.student); // TODO: Properly implement permissions
module.exports.assertAdmin = assertUserRole(models.roles.captain);
