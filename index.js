var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/book_app");

module.exports.Book = require("./book");