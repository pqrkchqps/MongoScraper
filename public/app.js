$(document).ready(() => {
  printNewArticles()
  printSavedArticles()
});

function printNewArticles() {
  console.log("Print Articles")
  $.getJSON("/articles", function (articles) {
    //console.log(data);
    $("#results-section").empty();

    var numResults = computeMax(articles.length, 20);
    appendArticles(articles, numResults);
  });
}
function printSavedArticles() {
  console.log("Print Saved Articles");
  $.getJSON("/saved-articles", function (articles) {
    $("#saved-section").empty();
    var numArticles = computeMax(articles.length, 20);
    for (var i = 0; i < numArticles; i++) {
      if (articles[i].note) {
        console.log("Found Note")
        appendNotesToArticleLater(articles[i]);
      }
      appendOneSavedArticle(articles[i]);
    }
  });
}

function computeMax(input, limit){
  let returnValue;
  if (input > limit) {
      returnValue = limit;
  }
  else returnValue = input;
  return returnValue;
}

function appendArticles(articles,numArticles){
  for (var i = 0; i < numArticles; i++) {
    //console.log(data[i]._id)
    $("#results-section").append(
        `<div class="card" id="result-${articles[i]._id}" >
        <div class="card-body">
            <h5 class="card-title">${articles[i].title}</h5>
            <p class="card-text">${articles[i].summary}</p>
            <button data-id='${articles[i]._id}' class="btn btn-primary save-btn" id='save'>Save</button>
            <a href="${articles[i].link}"  target="blank" class="btn btn-secondary">View Article</a>
        </div>
    </div>`);
  }
}

function appendNotesToArticleLater(article){
  let articleId = article._id;
  let numNotes = computeMax(article.note.length, 20)
  for (let j = 0; j < numNotes; j++){
    $.getJSON("/notes/" + article.note[j], function (note) {
      if (note) {
        console.log(note);
        let noteText = printNoteElementText(note);
        $("#card-note-"+articleId).append(noteText);
      }
    });
  }
}
function appendOneSavedArticle(article){
  $("#saved-section").append(
    `
      <div class="card" >
      <div class="card-body">
          <h5 class="card-title">${article.title}</h5>
          <p class="card-text">${article.summary}</p>
      </div>
      <ul class="list-group list-group-flush" id="card-note-${article._id}">
      </ul>
      <div class="card-body">
          <button class="btn btn-info" id="new-note-btn" data-id=${article._id}>New Note</button>
          <a href="${article.link}"  target="blank" class="btn btn-secondary">View Article</a>
          </div>
    </div>
    `);
}

function printNoteElementText(notedata){
  console.log(notedata);
  var note = '<li class="list-group-item" id="li-note-'
  note += notedata._id+'">'+notedata.body
  note += '<button class="btn btn-danger float-right" id="del-note" data-id="'+notedata._id+'">X</button>'
  note += '</li>'
  return note;
}

$(document).on("click", "#scrape-btn", function () {
    $.get("/scrape", function (scrapeData) {
        console.log(scrapeData);
    })
    .then(() => {
      console.log('scrape')
      printNewArticles();
    });
  });

$(document).on("click", "#save", function () {
    console.log("saved")
    var articleId = $(this).attr("data-id");
    $(`#result-${articleId}`).hide();
    console.log(articleId);
    $.ajax({
        method: "GET",
        url: "/articles/" + articleId
    })
    .then(function (article) {
        $(`#result-${article._id}`).display = 'none';
        putSavedOnArticleLater(article)
        printSavedArticles();
      });
  });
  function putSavedOnArticleLater(article){
    article.saved = true;
    $.ajax({
      type: "PUT",
      url: '/articles/'+article._id,
      data: article,
      success: () => console.log("Article Put")
    });
  }

$(document).on("click", "#new-note-btn", function () {
    // $("#notes").empty();
    // Save the id from the p tag
    var articleId = $(this).attr("data-id");
    console.log(articleId)

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + articleId
    })
    // With that done, add the note information to the page
    .then(function (article) {
        // console.log(data);
        activateNoteTextInputForArticle(article);
    });
});

function activateNoteTextInputForArticle(article){
  $("#enter-note").html(
  `<form>
    <div class="form-group">
      <label for="exampleFormControlTextarea1">${article.title}</label>
      <textarea class="form-control" id="bodyinput" rows="3"></textarea>
    </div>
    <button class="btn btn-success" data-id='${article._id}' id='savenote'>Save</button>
  </form>`
  );
}

$(document).on("click", "#savenote", function () {
    event.preventDefault();
    let noteInputText = $("#bodyinput").val();
    let articleId = $(this).attr("data-id");
    $("textarea").empty();
    console.log("note for id: " + articleId + "\nNote: " + noteInputText);

    $.ajax({
        method: "POST",
        url: "/notes",
        data: {
              articleId: articleId,
              text: noteInputText
              }
    }).then( note => {
        console.log(note)
        let noteElementText = printNoteElementText(note);
        $("#card-note-"+articleId).append(noteElementText);
    }).then(function (data) {
        //   console.log(data);
        $("#notes").empty();
    });
});

$(document).on("click", "#del-note", function(){
    let noteId=$(this).attr("data-id");
    console.log(noteId);
    $(`#li-note-${noteId}`).hide();
    $.ajax({
        method: "DELETE",
        url: "/notes/" + noteId
    })
})
