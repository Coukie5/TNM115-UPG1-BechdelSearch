let jsonobject = null;
let limit = 20;
let skipAmount = 0;
let numberOfMovies = 0;

document.addEventListener("DOMContentLoaded", async function(){
    console.log("HTML DOM tree loaded, and ready for manipulation.");
    
    await getImdbDb(null,limit,0)
});

const serverUrl = "http://127.0.0.1:3001";

// Function to get movies from IMDb database
async function getImdbDb(sort, limit, skipAmount){
    let filterUrl = null;

        try{
            const fromYear = document.getElementById("from-year-bar").value;
            const toYear = document.getElementById("to-year-bar").value;
            const selectedGenres = document.getElementsByClassName("selected"); 
            
            console.log(fromYear);
            console.log(toYear);
            filterUrl = "" + fromYear + "/" + toYear;

            for (let i = 0; i < selectedGenres.length; i++){
                filterUrl = filterUrl + "/" + selectedGenres[i].innerHTML;
            }
            console.log(filterUrl);
        }
        catch(err){
            console.log(err);
        }
        let url = serverUrl + "/" + sort + "/" + limit + "/" + skipAmount + "/" + filterUrl;
        if (searchKey !== "") {
            url = serverUrl + "/searchP/" + searchKey + "/" + sort + "/" + limit + "/" + skipAmount + "/" + filterUrl;
        }
        console.log(url);
        
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null
    });
    if(response.ok){
        response.json().then((jsonBody) => {
            console.log("The client request to the server was successful.");
            jsonobject = jsonBody.data;
            numberOfMovies = jsonBody.length;
            loadMovies();
        });
    }else{
        console.log("The client request tot the server was unsuccessful.");
        console.log(response.status + " | " + response.statusText);
    }
}
let pageNumber = 1;
function handlePage(direction){
    pageNumber = Number(document.getElementsByClassName("page-button")[0].id);
    if(direction === "back" && pageNumber > 1){
        pageNumber--;
    }else if(direction === "next" && jsonobject.length >= limit){
        pageNumber++;
    }
    console.log(pageNumber);
    skipAmount = (pageNumber-1)*limit;

    getImdbDb(currentSort,limit,skipAmount);
    document.getElementsByClassName("page-button")[0].id = pageNumber;
}

// Function to load more movies
async function getBechdelTitleId(){
    const response = await fetch(serverUrl , {
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
            loadMovies();
        });
    }else{
        console.log("The client request tot the server was unsuccessful.");
        console.log(response.status + " | " + response.statusText);
    }
}

// Function to search for a movie/movies
let searchKey = "";
async function searchMovie(){
    const movieNameTextValue = document.getElementById("moviename").value;
    console.log("Movie name:");
    console.log(movieNameTextValue);
    console.log(typeof(movieNameTextValue));
    console.log("==========");
    searchKey = movieNameTextValue;
    console.log(skipAmount)
    await getMoviesDbSearch(movieNameTextValue, limit, skipAmount);
    console.log(jsonobject)
}

// Function to find the searched movie/movies in the database
async function getMoviesDbSearch(search, limit, skipAmount){
    console.log(search)
    const response = await fetch(serverUrl + "/search/" + search + "/" + limit + "/" + skipAmount, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null
    });
    if(response.ok){
        response.json().then((jsonBody) => {
            console.log("The client request to the server was successful.");
            jsonobject = jsonBody.data;
            numberOfMovies = jsonBody.length;
            console.log(jsonobject.length)
            loadMovies();
        });
    }else{
        console.log("The client request tot the server was unsuccessful.");
        console.log(response.status + " | " + response.statusText);
    }
}

// Function to load movies 
function loadMovies(){
    const container = document.querySelector(".movies-container");
    if (container) {
        container.remove();
    }
    
    const divContainer = document.createElement("div");
    divContainer.className = "movies-container";

    const loadedMovies = document.createElement("div");
    const loadText = document.createElement("p");
    loadText.style = "font-size: 20px";
    loadText.style = "color: white";
    if(numberOfMovies > 0){
        loadText.innerHTML = "Loaded " + parseInt((pageNumber-1)*limit+1) + " - " + parseInt((pageNumber-1)*limit + jsonobject.length) + " of " + numberOfMovies;
    }else {
        loadText.innerHTML = "No movies found";
    }
    
    loadedMovies.appendChild(loadText);
    divContainer.appendChild(loadedMovies);

    console.log(jsonobject)

    const listElement = document.createElement("ol");
    jsonobject.forEach(function(movie) {
        const divMovieBox = document.createElement("div");
        divMovieBox.id = movie.IMDb._id;
        divMovieBox.className = "movie-box";
        divMovieBox.onclick = function(){
            window.location.href = "movieInfo.html?movie=" + divMovieBox.id;
        }
        const listItem = document.createElement("li");

        const textElement = document.createElement("h2");
        textElement.innerHTML = movie.IMDb.name;
        
        listItem.appendChild(textElement);

        const divMovieInfo = document.createElement("div");
        divMovieInfo.className = "div-movie-info";

        const textRuntime = document.createElement("p");
        textRuntime.className = "movie-item";
        textRuntime.innerHTML = "Duration: " + movie.IMDb.runtime;
        divMovieInfo.appendChild(textRuntime);

        const textYear = document.createElement("p");
        textYear.className = "movie-item";
        textYear.innerHTML = "Year :" + movie.IMDb.year;
        divMovieInfo.appendChild(textYear);

        const textImdb = document.createElement("p");
        textImdb.className = "movie-item";
        textImdb.innerHTML = "IMDb :" + movie.IMDb.rating;
        divMovieInfo.appendChild(textImdb);
        listItem.appendChild(divMovieInfo);
        
        const textDesc = document.createElement("p");
        textDesc.innerHTML = movie.IMDb.description;
        listItem.appendChild(textDesc);

        const divDirAct = document.createElement("div");
        divDirAct.className = "div-movie-info";

        const textDir = document.createElement("p");
        textDir.className = "movie-item";
        textDir.innerHTML = "Director: " + movie.IMDb.director[0];
        divDirAct.appendChild(textDir);
        
        if (movie.IMDb.star){
            const textStar = document.createElement("p");
            textStar.className = "movie-item";
            let actorText = "Actors: ";

            for(let i = 0; i < movie.IMDb.star.length && i < 2; i++){
                if(i+1 === 2){
                    actorText = actorText + movie.IMDb.star[i];
                }
                else{
                    actorText = actorText + movie.IMDb.star[i] + ", ";
                }
            }

            textStar.innerHTML = actorText;
            divDirAct.appendChild(textStar);
            listItem.appendChild(divDirAct);
        }
        
        const textVotes = document.createElement("p");
        textVotes.innerHTML = "Votes: " + movie.IMDb.votes;
        listItem.appendChild(textVotes);

        const textBechdel = document.createElement("p");
        textBechdel.className = ("div-movie-info")
        textBechdel.innerHTML = "Bechdel: passed " + movie.bechdel + " of 3 tests";
        listItem.appendChild(textBechdel);
        
        divMovieBox.appendChild(listItem);
        listElement.appendChild(divMovieBox);
    }); 
    divContainer.appendChild(listElement);
    const target = document.getElementById("target-movies")
    target.appendChild(divContainer);
}

// Function to calculate average bechdel score and number of movies for each catagory 
function calculate(){
    let average = 0;
    let sum = 0;
    let zero = 0;
    let one = 0;
    let two = 0;
    let three = 0;
    
    jsonobject.forEach(function(movie) {
        sum += movie.bechdel;
        switch(movie.bechdel) {
            case 0:
                zero++;
                break;
            case 1:
                one++;
                break;
            case 2:
                two++;
                break;
            case 3:
                three++;
                break;
            default:
                break;
        }
    });
    
    average = sum/jsonobject.length;

    document.getElementById('score-result0').innerText = zero;
    document.getElementById('score-result1').innerText = one;
    document.getElementById('score-result2').innerText = two;
    document.getElementById('score-result3').innerText = three;
    document.getElementById('score-result-average').innerText = average.toFixed(2);
}

let currentSort = null;

function sortBy() {
    var sortBy = document.getElementById("sortOptions").value;
    currentSort = sortBy;
    pageNumber = 1;
    document.getElementsByClassName("page-button")[0].id = pageNumber;
    skipAmount = 0;
    switch (sortBy) {
    case 'votes':
        getImdbDb('votes', limit, skipAmount);
        break;
      case 'name':
        getImdbDb('name', limit, skipAmount);
        break;
      case 'rating':
        getImdbDb('rating', limit, skipAmount);
        break;
      case 'runtime':
        getImdbDb('runtimeValue', limit, skipAmount);
        break;
      case 'bechdel':
        getImdbDb('bechdel', limit, skipAmount);
        break;
      case 'year':
        getImdbDb('year', limit, skipAmount);
        break;
      default:
        break;
    }
}

const genres = ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Drama', 
                'Family', 'Fantasy', 'Film-Noir', 'History', 'Horror', 'Music', 'Musical', 'Mystery',
                'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'];

function genreSelected() {
    const item = event.target;
    item.classList.toggle("selected");
    pageNumber = 1;
    document.getElementsByClassName("page-button")[0].id = pageNumber;
    skipAmount = 0;
    getImdbDb(currentSort,limit,skipAmount)
}

function filterDiv() {
    const divContainer = document.getElementById('filter-box');
    divContainer.className = 'filter-container';
    
    if (divContainer.style.display === "block") {
        divContainer.style.display = "none";
    }
    else {
        divContainer.style.display = "block";
        divContainer.innerHTML = '';
        const divRelease = document.createElement('div');
    divRelease.className = 'filter-release';

    const headerRelease = document.createElement('h3');
    headerRelease.innerHTML = 'Release year';
    divRelease.appendChild(headerRelease);

    const divYear = document.createElement('div');
    divYear.className = 'filter-year';

    const inputFrom = document.createElement('input');
    inputFrom.type = 'text';
    inputFrom.id = 'from-year-bar';
    inputFrom.value = '';
    inputFrom.placeholder = 'YYYY';
    inputFrom.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); 
            getImdbDb(null, limit, 0);
        }
    });
    divYear.appendChild(inputFrom);

    const labelYear = document.createElement('label');
    labelYear.innerHTML = ' to ';
    labelYear.htmlFor = inputFrom.id;
    divYear.appendChild(labelYear);

    const inputTo = document.createElement('input');
    inputTo.type = 'text';
    inputTo.id = 'to-year-bar';
    inputTo.value = '';
    inputTo.placeholder = 'YYYY';
    inputTo.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            getImdbDb(null, limit, 0);
        }
    });
    divYear.appendChild(inputTo);
    divRelease.appendChild(divYear);
    divContainer.appendChild(divRelease);

    const divGenre = document.createElement('div');
    divGenre.className = 'filter-genre';

    const headerGenre = document.createElement('h3');
    headerGenre.innerHTML = 'Genre';
    divGenre.appendChild(headerGenre);

    const listElement = document.createElement("ul");
    genres.forEach(function(genre) {
        const listItem = document.createElement("li");
        listItem.innerHTML = genre;
        listItem.onclick = function(){
            genreSelected();
        }
        listElement.appendChild(listItem);
    });
    divGenre.appendChild(listElement);
    divContainer.appendChild(divGenre);
    }
}