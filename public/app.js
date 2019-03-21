
$(document).on("click", "#scrape-btn", function () {
    $.get("/scrape", function(data){
        console.log(data);
    })
    .then(console.log('scrape'));
    $.getJSON("/articles", function (data) {
        console.log(data);
        $("#results-section").empty();
        let limitResults;
        if(data.length>20){
            limitResults=20;
            
        }
        else limitResults=data.length;
        numResults=limitResults
        for (var i = 0; i < limitResults; i++) {
            console.log(data[i]._id)
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
});

$(document).on("click", "#save", function(){
    console.log("test")
    var thisId = $(this).attr("data-id");
    console.log(thisId);
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
      })
        .then(function(data) {
            $(`#result-${thisId}`).display='none';
            $("#saved-section").append(
                `
                <div class="card" data-id=${thisId}>
                <div class="card-body">
                    <h5 class="card-title">${data.title}</h5>
                    <p class="card-text">${data.summary}</p>
                </div>
                <ul class="list-group list-group-flush card-notes">
                </ul>
                <div class="card-body">
                    <button class="btn btn-info" id="new-note-btn">New Note</button>
                    <a href="${data.link}"  target="blank" class="btn btn-secondary">View Article</a>
                    </div>
            </div>
                `
            );
})
});

$(document).on("click", "#new-note-btn", function() {

    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    console.log(thisId)
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        $("#enter-note").html(
            `<form>
            <div class="form-group">
                <label for="exampleFormControlTextarea1">Note for... ${data.title}</label>
                <textarea class="form-control" id="bodyinput" rows="3"></textarea>

            </div>
            <button class="btn btn-success" data-id='${data._id}' id='savenote'>Save</button>
        </form>`
            
        );


        // // The title of the article
        // $("#notes").append("<h2>" + data.title + "</h2>");
        // // An input to enter a new title
        // $("#notes").append("<input id='titleinput' name='title' >");
        // // A textarea to add a new note body
        // $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // // A button to submit a new note, with the id of the article saved to it
        // $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // // If there's a note in the article
        // if (data.note) {
        //   // Place the title of the note in the title input
        //   $("#titleinput").val(data.note.title);
        //   // Place the body of the note in the body textarea
        //   $("#bodyinput").val(data.note.body);
        // }
      });
  });

