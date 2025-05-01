let jsonImg = null;
document.addEventListener("DOMContentLoaded", async function(){
    console.log("HTML DOM tree loaded, and ready for manipulation.");

    const webpageURL = new URL(document.URL);
    const param = webpageURL.searchParams.get("movie");

    await getMoviesDbId(param);
    
});

async function getMoviesDbId(search){
    console.log(search)
    const response = await fetch(serverUrl + "/id/" + search, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null
    });
    if(response.ok){
        const response2 = await fetch(serverUrl + "/image/" + search , {
            method: "GET",
            headers: {
                "Content-Type": "image/png",
            }
        });
        if(response2.ok){
            response2.blob().then((blobBody) => {
                jsonImg = blobBody;
                console.log(jsonImg)
                response.json().then((jsonBody) => {
                    console.log("The client request to the server was successful.");
                    jsonobject = jsonBody;
                    loadMovieInfo();
                });
            });
        }
    }else{
        console.log("The client request tot the server was unsuccessful.");
        console.log(response.status + " | " + response.statusText);
    }
}

function loadMovieInfo() {
    const container = document.querySelector(".movieInfo-container");
    if (container) {
        container.remove();
    }
    
    const divContainer = document.createElement("div");
    divContainer.className = "movieInfo-container";

    //Background image
    const bgImg = document.querySelector("#target-Infomovies");
    
    let img = new Image();
    img.src = URL.createObjectURL(jsonImg);
  
    img.onload = function() {
        //bgImg.style.backgroundImage = "url(" + img.src + ")";
    }
        
    console.log(jsonobject)

    // Header
    const divMovieBox = document.createElement("div");
    divMovieBox.className = "movieInfo-header";

    console.log(jsonobject[0].bechdel)
    const textElement = document.createElement("h1");
    textElement.innerHTML = jsonobject[0].IMDb.name;
    
    divMovieBox.appendChild(textElement);
    divContainer.appendChild(divMovieBox);

    //Info: IMDb, Duration, Year
    const divMovieInfoCon = document.createElement("div");
    divMovieInfoCon.className = "movieInfo-Data-container";

    const divMovieInfo1 = document.createElement("div");
    divMovieInfo1.className = "movieInfo-Data-item";
    const textIMDb = document.createElement("p");
    textIMDb.innerHTML = "IMDb: " + jsonobject[0].IMDb.rating;
    divMovieInfo1.appendChild(textIMDb);
    divMovieInfoCon.appendChild(divMovieInfo1);
    
    const divMovieInfo2 = document.createElement("div");
    divMovieInfo2.className = "movieInfo-Data-item";
    const textRuntime = document.createElement("p");
    textRuntime.innerHTML = "Duration: " + jsonobject[0].IMDb.runtime;
    divMovieInfo2.appendChild(textRuntime);
    divMovieInfoCon.appendChild(divMovieInfo2);

    const divMovieInfo3 = document.createElement("div");
    divMovieInfo3.className = "movieInfo-Data-item";
    const textYear = document.createElement("p");
    textYear.innerHTML = "Year :" + jsonobject[0].IMDb.year;
    divMovieInfo3.appendChild(textYear);
    divMovieInfoCon.appendChild(divMovieInfo3);
    divContainer.appendChild(divMovieInfoCon);

    //Description
    const divMovieDesc = document.createElement("div");
    divMovieDesc.className = "movieInfo-Desc";

    const textDesc = document.createElement("p");
    textDesc.innerHTML = jsonobject[0].IMDb.description;
    divMovieDesc.appendChild(textDesc);

    divContainer.appendChild(divMovieDesc);
    
    //Genre
    const divMovieGenre = document.createElement("div");
    divMovieGenre.className = "movieInfo-genre";

    const listElement = document.createElement("ul");
    jsonobject[0].IMDb.genre.forEach(function(genre) {
        const listItem = document.createElement("li");
        listItem.innerHTML = genre;
        listElement.appendChild(listItem);
    });
    divMovieGenre.appendChild(listElement);
    divContainer.appendChild(divMovieGenre);

    //IMDb movie link
    const divMovieLink = document.createElement("div");
    divMovieLink.className = "movieInfo-link";

    const movieLink = document.createElement("a");
    movieLink.target="_blank";
    movieLink.href = "https://www.imdb.com/title/" + jsonobject[0].IMDb._id;
    movieLink.innerHTML = "https://www.imdb.com/title/" + jsonobject[0].IMDb._id;
    divMovieLink.appendChild(movieLink);
    divContainer.appendChild(divMovieLink);
                
    //Bechdel passed text
    const textBechdel = document.createElement("p");
    textBechdel.className = ("movieInfo-bechdel-text")
    textBechdel.innerHTML = "Bechdel: passed " + jsonobject[0].bechdel + " of 3 tests";
    divContainer.appendChild(textBechdel);

    //Bechdel box
    const divBechdelBox = document.createElement("div");
    divBechdelBox.className = "movieInfo-bechdel-box";

    const headCriteria = document.createElement("h3");
    headCriteria.className = "h3-criteria";
    headCriteria.innerHTML = "Criteria for bechdel test";
    divBechdelBox.appendChild(headCriteria);

    const listCriteria = document.createElement("ul");
    listCriteria.className = "list-criteria";

    const criteria = [
        "The movie must feature at least two named female characters.",
        "These characters must have a conversation with each other.",
        "The conversation must be about something other than a man."
    ];

    for(let i = 0; i < 3; i++){
        const itemCriteria = document.createElement("li");
        itemCriteria.innerHTML = criteria[i];
        if(i >= jsonobject[0].bechdel){
            itemCriteria.style.textDecoration = "line-through";
        }
        listCriteria.appendChild(itemCriteria);
    }
    divBechdelBox.appendChild(listCriteria);
    
    divContainer.appendChild(divBechdelBox);
    bgImg.appendChild(divContainer);
}