var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT =   process.env.PORT || 3000;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/mongoScraper", { useNewUrlParser: true });

// Routes
app.get("/scrape", function(req, res) {
    axios.get("https://www.npr.org/sections/news/").then(function(response) {

      var $ = cheerio.load(response.data);
  
      $("div.item-info").each(function(i, element) {
        var result = {};
  
        result.title = $(this)
          .children("h2.title")
          .text();
        result.link = $(this)
          .children("h2.title")
          .children("a")
          .attr("href");
        result.summary= $(this)
            .children("p")
            .text();

        console.log(result);
  
        db.Article.create(result)
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
            console.log(err);
          });
      });
  
      res.send("Scrape Complete");
    });
  });

  app.get("/articles", function(req, res) {
    db.Article.find({}) 
      .then( articles => res.json(articles))
  });

  app.get("/articles/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id}) 
      .populate("note")
      .then( article => res.json(article))
  });

  app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
      .then( dbNote => db.Article.findOneAndUpdate(
              {_id:req.params.id},
              {$set:{note:dbNote._id}})    
      )
      .then(dbArticle => res.json(dbArticle))
      .catch( err => res.json(500, err))  
  });

  // Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  