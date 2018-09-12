models = require('../models');

function assertUserAuthenticated(req, res, next) {
  if (!req.user) {
    res.status(401).send({reason: "authentication required"});
    return;
  }
  return models.Team.findOne({ students: { $elemMatch: { user: req.user._id } } }).then(team => {
    req.team = team;
    for (let student of req.team.students) {
      if (student.user.equals(req.user._id)) req.team.user_role = student.role;
    }
    next();
  }, next);
}

/** Check whether a particular user has permissions within a particular team to do a particular action. */
function assertHasRole(role) {
  return function wrapper(req, res, next) {
    const authenticated = assertUserAuthenticated(req, res, () => { });
    if (!authenticated) return;
    authenticated.then(() => {
      if (role === models.roles.public) next();
      else {
        if (req.user.admin || req.team.user_role >= role) next();
        else res.status(401).send({reason: "insufficient permissions"});
      }
    });
  };
}

module.exports.assertHasRole = assertHasRole;
module.exports.assertUserAuthenticated = assertHasRole(models.roles.public);
module.exports.assertStudent = assertHasRole(models.roles.student);
module.exports.assertAdmin = assertHasRole(models.roles.captain);
