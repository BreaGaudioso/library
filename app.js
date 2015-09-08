
var express = require('express')
var app = express();
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

var bookSchema = new mongoose.Schema({
    name: String,
    author: String,
    year: Number
});
var Book = mongoose.model('Book', bookSchema);


//library
app.get('/books', function (req, res){
	Book.find({}, function(err, books) {
		res.render("index" , { books: books })
  });
});

//new book form Works
app.get('/books/new', function (req, res){
	res.render('bookform', {word: "Add"})
});

//add new book WORKS
app.post("/books", function(req,res){
	Book.create(
		{
			name: req.body.title,
			author: req.body.author, 
			year: req.body.year
		}, function( err, book){
			if (err){
				console.log(err);
			} else {
				console.log(book)
			}
		}
	);


	res.redirect('/books')
});


// get book by id 
app.get('/books/:id', function (req, res){
	id = req.params.id;
	Book.findById(id, function (err, found) {
  res.render("saved", { book: found })
	});
})


app.delete('/books/:id', function (req, res){
	id = req.params.id;
	Book.findByIdAndRemove(id, function (err, del) { 
	});
	res.redirect('/books');
})


app.put('/books/:id', function (req, res){
	console.log('req:   ', req.body);
	id = req.params.id;
	Book.findByIdAndUpdate (id, {
			name: req.body.title,
			author: req.body.author, 
			year: req.body.year
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


// app.get('/books/:id', function (req, res, next){
// 	id = req.params.id;
// 	book = books[parseInt(id)]
// 	if (book != undefined) {
// 	res.render("saved", { book: book})
// } else {
// 	next();
// }
// })

// Book.findByIdAndRemove(id, function (err, del) {





