/** Helper function to only copy a subset of an object's fields. Useful for API endpoints. */
function mask(obj, keys) {
  let masked_obj = {};
  for (let key of keys) {
    masked_obj[key] = obj[key];
  }
  return masked_obj;
}

module.exports = {
  mask: mask
};
