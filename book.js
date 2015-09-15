var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
                   title: {type: String, required: true},
                   author: String,
                   year: Number
                  });

var Book = mongoose.model("Book", bookSchema);

module.exports = Book;