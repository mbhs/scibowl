/** Check a user is logged in.
 *
 * Can be used as middleware; calls the next function if the user is
 * logged in and sends a 401 otherwise.
 */
function assertUserAuthenticated(req, res, next) {
  if (req.user) next();
  else res.status(401).send({});
}
