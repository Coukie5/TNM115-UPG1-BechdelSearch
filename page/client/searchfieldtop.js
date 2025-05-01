document.addEventListener('DOMContentLoaded', function() {
    console.log('HTML DOM tree loaded, and ready for manipulation.');
    let searchInput = document.querySelector('.search-data');
    if (searchInput) {
        searchInput.addEventListener('input', function(event) {
            let inputValue = event.target.value;
            console.log(inputValue);
            if(inputValue !== ""){
                getMoviesDbSearch(inputValue);
            }
            else{
                let searchResultsDiv = document.querySelector('#search-results-nav');
                searchResultsDiv.innerHTML = '';
            }
        });
    } else {
        console.log('Element with class .search-data not found');
    }
});

const serverUrl = "http://127.0.0.1:3001";

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
    let searchResultsDiv = document.querySelector('#search-results-nav');
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