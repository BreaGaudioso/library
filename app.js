var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require("./models");
var methodOverride = require("method-override");
var session = require("cookie-session");
var u = require('underscore');
var loginMiddleware = require("./middleware/loginHelper");
var routeMiddleware = require("./middleware/routeHelper");
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(session({
  maxAge: 3600000,
  secret: 'secret',
  name: "Name"
}));

//middleware here
app.use(loginMiddleware);

//login or create an account
app.get('/', function (req, res){
  res.render('usersIndex')
})

//get signup view
app.get('/signup', function(req,res){
  res.render('usersSignup');
});

//signup post
app.post("/signup", function (req, res) {
  var newUser = req.body.user;
  db.User.create(newUser, function (err, user) {
    if (user) {
      req.login(user);
      console.log(req.body);
      res.redirect("/books");
    } else {
      console.log(err);
      res.render("usersSignup");
    }
  });
});

//get login view
app.get("/login", function (req, res) {
  res.render("usersLogin");
});

//login post
app.post("/login", function (req, res) {
  db.User.authenticate(req.body.user,
  function (err, user) {
    if (!err && user !== null) {
      req.login(user);
      console.log(req.body);
      res.redirect("/books");
    } else {
      // TODO - handle errors in ejs!
      res.render("usersLogin");
    }
  });
});


//library
app.get('/books', routeMiddleware.ensureLoggedIn, function (req, res){
	db.Book.find({}, function(err, books) {
		res.render("index" , { books: books } )
  });
});

//new book form 
app.get('/books/new', function (req, res){
	res.render('bookform', {word: "Add"})
});

//add new book 
app.post("/books", function(req,res){
	db.Book.create(
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
app.get('/search', function (req, res){
  res.render('search')
});

//get book from google books
app.get('/searchresults', function (req,res){
 title = encodeURIComponent(req.query.book);
 var request = require('request');
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
  db.Book.findById(id, function (err, book) {
  res.render("saved", { book: book })
  });
})

//delete
app.delete('/books/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUser, function (req, res){
	id = req.params.id;
	db.Book.findByIdAndRemove(id, function (err, del) { 
	});
	res.redirect('/books');
})

app.put('/books/:id', function (req, res){
	id = req.params.id;
	db.Book.findByIdAndUpdate (id, {
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

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get('*', function(req,res){
  res.render('error');
});

app.listen(3000, function(){
})