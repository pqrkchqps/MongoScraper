$(document).ready(() => {
  printNewArticles()
  printSavedArticles()
});

function printNewArticles() {
  console.log("Print Articles")
  $.getJSON("/articles", function (data) {
      //console.log(data);
      $("#results-section").empty();
      let limitResults;
      if (data.length > 20) {
          limitResults = 20;
      }
      else limitResults = data.length;
      numResults = limitResults
      for (var i = 0; i < limitResults; i++) {
          //console.log(data[i]._id)
          $("#results-section").append(
              `<div class="card" id="result-${data[i]._id}" >
              <div class="card-body">
                  <h5 class="card-title">${data[i].title}</h5>
                  <p class="card-text">${data[i].summary}</p>
                  <button data-id='${data[i]._id}' class="btn btn-primary save-btn" id='save'>Save</button>
                  <a href="${data[i].link}"  target="blank" class="btn btn-secondary">View Article</a>
              </div>
          </div>`);
        }
      });
}

function printSavedArticles() {
  console.log("Print Saved Articles");
  $.getJSON("/saved-articles", function (data) {
    $("#saved-section").empty();
    let limitResults;
    if (data.length > 20) {
        limitResults = 20;
    }
    else limitResults = data.length;
    numResults = limitResults
    for (var i = 0; i < limitResults; i++) {
        let div_id = data[i]._id

          if (data[i].note) {
            console.log("Found Note")
            for (let j = 0; j < data[i].note.length; j++){
              $.getJSON("/notes/" +data[i].note[j], function (notedata) {
                if (notedata) {
                  console.log(notedata);
                  let note = printNoteElementText(notedata);
                  $("#card-note-"+div_id).append(note);
                }
              });
            }
          }
          $("#saved-section").append(
            `
            <div class="card" >
            <div class="card-body">
                <h5 class="card-title">${data[i].title}</h5>
                <p class="card-text">${data[i].summary}</p>
            </div>
            <ul class="list-group list-group-flush" id="card-note-${data[i]._id}">
            </ul>
            <div class="card-body">
                <button class="btn btn-info" id="new-note-btn" data-id=${data[i]._id}>New Note</button>
                <a href="${data.link}"  target="blank" class="btn btn-secondary">View Article</a>
                </div>
          </div>
            `);
      }
    });
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
    $.get("/scrape", function (data) {
        console.log(data);
    })
    .then(() => {
      console.log('scrape')
      printNewArticles();
    });
  });

$(document).on("click", "#save", function () {
    console.log("saved")
    var thisId = $(this).attr("data-id");
    $(`#result-${thisId}`).hide();
    console.log(thisId);
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        .then(function (data) {
            $(`#result-${thisId}`).display = 'none';
            data.saved = true;
            $.ajax({
              type: "PUT",
              url: '/articles/'+thisId,
              data: data,
              success: () => console.log("Article Put")
            });
            printSavedArticles();
          });
  });

$(document).on("click", "#new-note-btn", function () {

    // $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    console.log(thisId)

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    // With that done, add the note information to the page
    .then(function (data) {
        // console.log(data);

        $("#enter-note").html(
        `<form>
          <div class="form-group">
            <label for="exampleFormControlTextarea1">${data.title}</label>
            <textarea class="form-control" id="bodyinput" rows="3"></textarea>
          </div>
          <button class="btn btn-success" data-id='${data._id}' id='savenote'>Save</button>
        </form>`
        );
    });
});


$(document).on("click", "#savenote", function () {
    event.preventDefault();
    let note = $("#bodyinput").val();
    let thisId = $(this).attr("data-id");
    $("textarea").empty();
    console.log("note for id: " + thisId + "\nNote: " + note);

    $.ajax({
        method: "POST",
        url: "/notes",
        data: {
              articleId: thisId,
              text: note
              }
    }).then( notedata => {
        console.log(notedata)
        let note = printNoteElementText(notedata);
        $("#card-note-"+thisId).append(note);
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
