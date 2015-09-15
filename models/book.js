var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
    title: String,
    authors: String,
    year: Number,
    rate: Number,
    price: Number,
    isbn: Number
});

var Book = mongoose.model('Book', bookSchema);
module.exports = Book;