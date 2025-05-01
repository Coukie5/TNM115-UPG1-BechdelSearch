//Eventlistener for the search input field
document.addEventListener('DOMContentLoaded', function() {
    console.log('HTML DOM tree loaded, and ready for manipulation.');
    getMovieRandom(randomizeMovie())
    let searchInput = document.querySelector('.search-data-middle');
    if (searchInput) {
        searchInput.addEventListener('input', function(event) {
            let inputValue = event.target.value;
            console.log(inputValue);
            if(inputValue !== ""){
                getMoviesDbSearch(inputValue);
            }
            else{
                let searchResultsDiv = document.querySelector('#search-results');
                searchResultsDiv.innerHTML = '';
            }
        });
    } else {
        console.log('Element with class .search-data-middle not found');
    }
});

const serverUrl = "http://127.0.0.1:3001";

// Function to find the searched movie/movies in the database
async function getMoviesDbSearch(search){
    console.log(search)
    const response = await fetch(serverUrl + "/searchMovie/" + search, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });
    if(response.ok){
        response.json().then((jsonBody) => {
            console.log("The client request to the server was successful.");
            jsonobject = jsonBody;
            console.log(jsonobject);
            searchBox();
        });
    }else{
        console.log("The client request tot the server was unsuccessful.");
        console.log(response.status + " | " + response.statusText);
    }
}

function searchBox(){
    let searchResultsDiv = document.querySelector('#search-results');
    searchResultsDiv.innerHTML = '';

    for(let i = 0; i < 8; i++){
        let resultDiv = document.createElement('div');
        resultDiv.innerHTML = jsonobject[i].IMDb.name;
        resultDiv.onclick = function(){
            window.location.href = "movieInfo.html?movie=" + jsonobject[i].IMDb._id;
        }
    searchResultsDiv.appendChild(resultDiv);
    };
    console.log(searchResultsDiv);
}

function randomizeMovie(){
    let random = Math.floor(Math.random()*10);
    console.log(random)
    return random;
}

async function getMovieRandom(random){
    const response = await fetch(serverUrl + "/random/" + random , {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null
    });
    if(response.ok){
        response.json().then((jsonBody) => {
            console.log("The client request to the server was successful.");
            jsonobject = jsonBody;
            console.log(jsonobject);
            loadRandomMovie();
        });
    }else{
        console.log("The client request tot the server was unsuccessful.");
        console.log(response.status + " | " + response.statusText);
    }
}

const movieTrailers = {
    'The Dark Knight': 'https://www.youtube.com/embed/LDG9bisJEaI?si=o9VZDDgP9gHkLBuY',
    'Inception': 'https://www.youtube.com/embed/8hP9D6kZseM?si=7EGxyhLIfHsuV8km',
    'Pulp Fiction': 'https://www.youtube.com/embed/tGpTpVyI_OQ?si=A1lUzGpq_bpr7_AB',
    'The Matrix': 'https://www.youtube.com/embed/m8e-FF8MsqU?si=PtvzC8hcEdKKs2ww',
    'The Lord of the Rings: The Fellowship of the Ring': 'https://www.youtube.com/embed/_nZdmwHrcnw?si=PYKq0WUFbuxR0mx_',
    'The Godfather': 'https://www.youtube.com/embed/UaVTIH8mujA?si=PbhwXxKeLuooEC9M',
    'The Lord of the Rings: The Return of the King': 'https://www.youtube.com/embed/zckJCxYxn1g?si=7wlpDiwbYK3zXWQD',
    'Interstellar': 'https://www.youtube.com/embed/zSWdZVtXT7E?si=pWW2Kv9C6lFqU3vc',
    'The Dark Knight Rises': 'https://www.youtube.com/embed/g8evyE9TuYk?si=_HLeMYih_JLayWQf',
    'The Lord of the Rings: The Two Towers': 'https://www.youtube.com/embed/hYcw5ksV8YQ?si=TsnAVSJmAXSuLVHH'
}


function loadRandomMovie() {
    const div = document.getElementById("black-box");
    const header = document.createElement("h1");
    header.innerHTML = "Popular Movie";
    div.appendChild(header);

    const movie = jsonobject[0].IMDb.name;

    const a = document.createElement("a");
    a.href = "movieInfo.html?movie=" + jsonobject[0].IMDb._id;
    a.innerHTML = movie;
    div.appendChild(a);

    const videoContainer = document.createElement("div");
    videoContainer.className = "video-container";
    div.appendChild(videoContainer);

    const iframe = document.createElement("iframe");
    iframe.src = movieTrailers[movie];
    iframe.allowFullscreen = "0";
    videoContainer.appendChild(iframe);
}