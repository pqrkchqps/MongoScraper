let noteCounter=0;
$(document).on("load", function () {
//here is where I would actually start off displaying any saved articles, 
//but I couldnt get the save property in the article object to get switched when I clicked
//save. I think it had to do with my PUT route, but not really sure. 
})

$(document).on("click", "#scrape-btn", function () {
    $.get("/scrape", function (data) {
        console.log(data);
    })
        .then(console.log('scrape'));
    $.getJSON("/articles", function (data) {
        console.log(data);
        $("#results-section").empty();
        let limitResults;
        if (data.length > 20) {
            limitResults = 20;

        }
        else limitResults = data.length;
        numResults = limitResults
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

$(document).on("click", "#save", function () {
    console.log("test")
    var thisId = $(this).attr("data-id");
    $(`#result-${thisId}`).hide();
    console.log(thisId);
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        .then(function (data) {
            $(`#result-${thisId}`).display = 'none';
            $("#saved-section").append(
                `
                <div class="card" >
                <div class="card-body">
                    <h5 class="card-title">${data.title}</h5>
                    <p class="card-text">${data.summary}</p>
                </div>
                <ul class="list-group list-group-flush" id="card-note-${thisId}">
                </ul>
                <div class="card-body">
                    <button class="btn btn-info" id="new-note-btn" data-id=${thisId}>New Note</button>
                    <a href="${data.link}"  target="blank" class="btn btn-secondary">View Article</a>
                    </div>
            </div>
                `
            );


        });
    // $.ajax({
    //     method: "PUT",
    //     url: "/articles/" + thisId,
    //     data: {
    //         saved: true
    //     }
    // })
    //     .then(function (data) {
    //         console.log("changing saved status");
    //         console.log(data);
    //     });
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



    $(`#card-note-${thisId}`).append(
        `<li class="list-group-item" id="li-note-${noteCounter}">${note} <button
        class="btn btn-danger float-right" id="del-note" data-id="${noteCounter}">X</button></li>`
    );
    noteCounter++;

    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            body: note
        }
    })
        .then(function (data) {
            //   console.log(data);
            $("#notes").empty();
        });


});

$(document).on("click", "#del-note", function(){
    let noteId=$(this).attr("data-id");
    console.log(noteId);
    $(`#li-note-${noteId}`).hide();
})
