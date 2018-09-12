models = require('../models');

/** Check whether a particular user has permissions within a particular team to do a particular action. */
function assertHasRole(role) {
  function wrapper(req, res, next) {
    if (role > models.roles.public && !req.user) res.status(401).send();
    return models.Team.findOne({ _id: req.params.id }).then(team => {
      req.team = team;
      let authorized = false;
      for (let student of team.students) {
        if (student.user === req.user._id && student.role >= role) authorized = true;
      }
      if (authorized) next();
      else res.status(401).send();
    });
  }
}

module.exports.assertHasRole = assertHasRole;
module.exports.assertUserAuthenticated = assertHasRole(models.roles.public);
module.exports.assertStudent = assertHasRole(models.roles.student); // TODO: Properly implement permissions
module.exports.assertAdmin = assertHasRole(models.roles.captain);
