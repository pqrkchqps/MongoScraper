var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT =  process.env.PORT ||  3000;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


// Routes
app.get("/scrape", function(req, res) {
  axios.get("https://www.npr.org/sections/news/").then(function(response) {
      var $ = cheerio.load(response.data);
      var articles = scrapeCheerioArticles($);
      saveArticlesAndRemoveDups(articles, res);
  });
});

function scrapeCheerioArticles($){
  var articles = [];
  $("div.item-info").each(function(i, element) {
    articles[i] = {};
    articles[i].title = $(this)
      .children("h2.title")
      .text();
    articles[i].link = $(this)
      .children("h2.title")
      .children("a")
      .attr("href");
    articles[i].summary= $(this)
        .children("p")
        .text();
    console.log(articles[i]);
  });
  return articles;
}

function saveArticlesAndRemoveDups(articles, res){
  db.Article.create(articles)
    .then(function(savedArticles) {
      console.log(savedArticles);
      removeDupsByLink(res);
    })
    .catch(function(err) {
      console.log(err);
    });
}

function removeDupsByLink(res) {
  var previousLink;
  db.Article.find({}).sort('link').exec((err, articles) => {
    articles.forEach(article => {
      var link = article.link;
      if (previousLink == link) {
        console.log(link);
        article.remove();
      }
      previousLink = link;
    });
    res.send("Scrap Complete");
  });
}

app.get("/articles", function(req, res) {
  db.Article.find({saved: false}).sort({$natural:-1})
    .then( articles => res.json(articles))
});
app.get("/saved-articles", function(req, res) {
  db.Article.find({saved: true}).sort({$natural:-1})
    .then( articles => res.json(articles))
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then( article => res.json(article))
});

app.get("/notes/:id", function(req, res) {
  db.Note.findOne({_id: req.params.id})
    .then( note => res.json(note))
});

app.delete("/notes/:id", function(req, res) {
  db.Note.findByIdAndRemove(req.params.id, (err, note) =>{
    if (err) return res.status(500).send(err);

    const response = {
      message: "Note successfully deleted",
    };
    return res.status(200).send(response);
  })
});

app.post("/notes", function(req, res) {
  db.Note.create({body: req.body.text})
    .then( note => {
      console.log("dbNote:")
      console.log(note)
      console.log("articleId:",req.body.articleId);

      saveNoteToArticleId(note, req.body.articleId, res);
    })
    .catch( err => res.json(500, err))
});
function saveNoteToArticleId(note, articleId, res){
  db.Article.findOneAndUpdate({_id: articleId}, {$push:{note: note._id}}, {upsert:true},
    (err, article) => {
      if (err) return res.send(500, { error: err });
      return res.send(note);
    }
  );
}

  app.put("/articles/:id", function(req, res){
    var article = req.body;
    db.Article.updateOne({_id: req.params.id}, article)
    .then(()=>res.send("One Updated"));
  });


  // Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
