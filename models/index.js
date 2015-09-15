
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/library");
module.exports.User = require("./user");
module.exports.Book = require("./book");