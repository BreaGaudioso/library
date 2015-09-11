var express = require('express')
var app = express();
var request = require('request');
app.set('view engine', 'ejs');
app.use(express.static("public"))
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));
var methodOverride = require('method-override');
app.use(methodOverride('_method'));
var mongoose = require("mongoose");
mongoose.set('debug', true);
var db = mongoose.connection;
mongoose.connect("mongodb://localhost/test");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
 console.log("yay!")
});

//created schema
var bookSchema = new mongoose.Schema({
    title: String,
    authors: String,
    year: Number,
    rate: Number,
    price: Number,
    isbn: Number
});
//model
var Book = mongoose.model('Book', bookSchema);

//library
app.get('/books', function (req, res){
	Book.find({}, function(err, books) {
		res.render("index" , { books: books })
  });
});

//new book form 
app.get('/books/new', function (req, res){
	res.render('bookform', {word: "Add"})
});

//add new book 
app.post("/books", function(req,res){
	Book.create(
		{
			title: req.body.title,
			authors: req.body.authors, 
			year: req.body.year,
      rate: req.body.rate,
      price: req.body.price,
      isbn: req.body.isbn,
      cover: req.body.cover

		}, function( err, book){
			if (err){
				throw err;
			}
		}
	);
	res.redirect('/books')
});

//new book form Works
app.get('/', function (req, res){
  res.render('search')
});

//get book from google books
app.get('/searchresults', function (req,res){
 title = encodeURIComponent(req.query.book);
  request.get("https://www.googleapis.com/books/v1/volumes?q="+title+"&key=AIzaSyCBC2oaertogkkDLbhdE2ZBG8a9KWnnKXM", function(error, response, body){
    if (error) {
      console.log("Error!  Request failed - " + error);
    } 
    var data = JSON.parse(body);
    books=[]
    data.items.forEach(function(data){
      var book = {};

      if (data.volumeInfo.title && data.volumeInfo) {
        book.title = data.volumeInfo.title
      } 
      if (data.volumeInfo.authors && data.volumeInfo){
        book.authors = data.volumeInfo.authors
      }
      if (data.volumeInfo.publishedDate && data.volumeInfo){
        book.year = data.volumeInfo.publishedDate
      } 
      if (data.saleInfo && data.saleInfo.listPrice && data.saleInfo.listPrice.amount){
        book.price = data.saleInfo.listPrice.amount
      }
      if (data.volumeInfo.averageRating && data.volumeInfo){
        book.rate = data.volumeInfo.averageRating
      }
      if (data.volumeInfo && data.volumeInfo.industryIdentifiers[0] && data.volumeInfo.industryIdentifiers[0].identifier){
        book.isbn = data.volumeInfo.industryIdentifiers[0].identifier
      }
      if (data.volumeInfo && data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail){
        book.cover = data.volumeInfo.imageLinks.thumbnail
      }

      books.push(book);
    });
    res.render("searchresults", {books:books});
  });
});

// get book by id 
app.get('/books/:id', function (req, res){
	id = req.params.id;
	Book.findById(id, function (err, found) {
  res.render("saved", { book: found })
	});
})

//delete
app.delete('/books/:id', function (req, res){
	id = req.params.id;
	Book.findByIdAndRemove(id, function (err, del) { 
	});
	res.redirect('/books');
})

app.put('/books/:id', function (req, res){
	id = req.params.id;
	Book.findByIdAndUpdate (id, {
		  name: req.body.title,
      cover: req.body.cover,
      authors: req.body.author, 
      year: req.body.year,
      rate: req.body.rate,
      price: req.body.price,
      isbn: req.body.isbn
		},  function (err, up){
	});
	res.redirect('/books')
})

app.get('*', function(req, res, next) {
  var err = new Error();
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  if(err.status !== 404) {
    return next();
  }

  res.status(404);
  res.render("error");
});


app.listen(3000, function(){
})