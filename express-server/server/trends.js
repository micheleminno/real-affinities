const OK = 200;
const NOK = 404;


exports.add = function(req, res) {

  const name = req.query.name;
  const nameWithoutInnerSpaces = name.replace(/ /g, "-");

  console.log("Adding new trend: " + nameWithoutInnerSpaces);

  const query = req.query.query;

  // TODO
};

exports.remove = function(req, res) {

  const name = req.query.name;
  const nameWithoutInnerSpaces = name.replace(/ /g, "-");

  console.log("Removing trend: " + nameWithoutInnerSpaces);

  // TODO
};

exports.removeAll = function(req, res) {

  console.log("Removing all trends");

  // TODO
};

exports.update = function(req, res) {

  const text = req.query.text;
  const name = req.query.name;

  console.log("Updating trend with name " + name + " with text " + text);

  const nameWithoutInnerSpaces = name.replace(/ /g, "-");

  console.log("Name trend without inner spaces: " + nameWithoutInnerSpaces);

  // TODO
};

exports.list = function(req, res) {

  const withContent = req.query.withContent;

  console.log("Getting all trends");

  // TODO
};
