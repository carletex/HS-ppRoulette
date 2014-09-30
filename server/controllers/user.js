module.exports.getId = function(req, res) {
  res.json({"hsId": req.session.userId});
}