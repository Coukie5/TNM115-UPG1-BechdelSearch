// declaration and loading (inclusion) of various modules
const http = require("node:http");
const MongoClient = require("mongodb").MongoClient;
const fs = require("node:fs");

//MongoDB server
const dbHostname = "127.0.0.1";
const dbPort = 27017;
const dbServerUrl = "mongodb://" + dbHostname + ":" + dbPort + "";

// inizialize MongoDB connector instance
const dbClient = new MongoClient(dbServerUrl);

// initialization of server properties
const hostname = "127.0.0.1";
const port = 3001;
const serverUrl = "http://" + hostname + ":" + port + "";

// initialization of server object
const server = http.createServer(async (req, res) => {
    console.log("create server");
    const requestUrl = new URL(serverUrl + req.url);
    const pathComponents = requestUrl.pathname.split("/");
    console.log(pathComponents);

    if(req.method == "GET"){
        if(pathComponents[1] === "search"){
            const searchPara = decodeURIComponent(pathComponents[2]);
            const dbMovie = await getDatabaseSearch(searchPara, parseInt(pathComponents[3]), parseInt(pathComponents[4]));
            routing_data(res, JSON.stringify(dbMovie));
        }else if(pathComponents[1] === "searchMovie"){
            const searchPara = decodeURIComponent(pathComponents[2]);
            const dbMovie = await getDatabaseSearchMovie(searchPara);
            sendResponse(res, 200, "application/json", JSON.stringify(dbMovie));
        }else if (pathComponents[1] === "id"){
            const idPara = decodeURIComponent(pathComponents[2]);
            const dbMovie = await getDatabaseId(idPara);
            routing_data(res, JSON.stringify(dbMovie));
        }else if(pathComponents[1] === "random"){
            const dbMovie = await getDatabaseRandom(parseInt(pathComponents[2]));
            sendResponse(res, 200, "application/json", JSON.stringify(dbMovie));
        }else if(pathComponents[1] === "image"){
            routing_image(res, pathComponents[2]);
        } else if(pathComponents[1] === "searchP"){
            const searchPara = decodeURIComponent(pathComponents[2]);
            console.log("THIS IS THE SEARCHPARA: " + searchPara);
            let db;
            if(pathComponents[3] == "null"){
                pathComponents[3] = null;
            }
            if(pathComponents[6] == "null"){
                pathComponents[6] = null;
            }
            let filter = [];
            for(let i = 6; i < pathComponents.length; i++){
                filter.push(pathComponents[i]);
            }
            console.log(filter);
            const dbMovie = await getDatabase(pathComponents[3], filter, parseInt(pathComponents[4]), parseInt(pathComponents[5]), searchPara);
            
            sendResponse(res, 200, "application/json", JSON.stringify(dbMovie));
        }else{
            let db;
            if (pathComponents[1] == "null"){
                pathComponents[1] = null;
            } 
            if (pathComponents[4] == "null"){
                pathComponents[4] = null
            }
            let filter = [];
            console.log(pathComponents[4]);
            for(let i = 4; i < pathComponents.length; i++){
                filter.push(pathComponents[i]);
            }
            console.log(filter);
            db = await getDatabase(pathComponents[1], filter,parseInt(pathComponents[2]), parseInt(pathComponents[3]));
            sendResponse(res, 200, "application/json", JSON.stringify(db));
        }       
        
    }
    else if(req.method == "OPTIONS"){
        sendResponse(res, 204, null, null);
    }
    else if(req.method == "POST"){
        sendResponse(res, 200, "text/plain", "Welcome on the ARTIST");
    }
});

// start up of the initialized (and configured) server
server.listen(port, hostname, () => {
    console.log("The server running and listening at\n" + serverUrl);
});

// Function to send HTTP response message
function sendResponse(res, statusCode, contentType, data){
    //configure HTTP response status code, and (if required) Content-Type header
    console.log("sendResponse");
    res.statusCode = statusCode;
    if(contentType != null){
        res.setHeader("Content-Type", contentType);
    }

    // configure HTTP response message header to allow Cross-Origin Resource 
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if(data != null){
        res.end(data);      //data in HTTP message body
    }else{  
        res.end();          //empty HTTP message body
    }
}

function routing_data(res, jsonString) {
    try {
        const movieJsonDataFromDb = JSON.parse(jsonString);
        sendResponse(res, 200, "application/json", jsonString);
    } catch (error) {
        // Handle JSON parsing error
        console.error("Error parsing JSON:", error);
        sendResponse(res, 500, "text/plain", "Internal Server Error");
    }
}

function routing_image(res, pathComponents){

    // implementation of some simple error handling:
    // check if there is an insufficient amount of components in the URL's pathname
    if(pathComponents.length <= 2) sendResponse(res, 400, null, null);  // if no imageName was present in the URL, respond with 400 (Bad Request); docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
    else {

        // construct the image file path, based on the internal server directory/files organization
        const imageFilePath = "./MoviePosterDataBase/MoviePosterDataBase/" + pathComponents + ".png";      // observe: ./ at the beginning indicates that the following filepath is relative to THIS file (app.js); in this case, the "media" directory is on the same file level as the "app.js" file

        fs.readFile(imageFilePath, (err, data) => {

            // error handling
            if(err){
                console.log("An error ocurred when attempting to read the file at: " + imageFilePath);
                sendResponse(res, 404, null, null); // respond with 404 (Not Found); docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
            } 
            // success handling
            else {
                // send read (serialized) file data as MIME type "image/svg+xml"
                sendResponse(res, 200, "image/png", data); 
            }
        });
    }
}

// Function to recive movies from the database based on search criteria
async function getDatabaseSearch(searchName, limit, skipAmount){
    
    const db = dbClient.db("tnm115-project");
    const dbCollection = db.collection("movieDb");  

    console.log(searchName)

    // '$regex' operator in MongoDB is used to search for specific strings in the collection
    // 'new RegExp' object is used for matching text with a pattern.
    // 'i' ensures that the search is case-insensitive, matching both uppercase and lowercase letters
    const filterQuery = { "IMDb.name": { $regex: new RegExp(searchName, 'i') } };
    const sortQuery = { "IMDb.votes": -1 };
    const projectionQuery = { _id: 0, IMDb: 1, bechdel: 1 };

    const findLength = (await dbCollection.find(filterQuery).toArray()).length;
    const findResult = await dbCollection.find(filterQuery).sort(sortQuery).project(projectionQuery).skip(skipAmount).limit(limit).toArray();
    console.log("Found/Projected Documents:", findResult);

    return jsonResult = { length: findLength, data: findResult };
}

async function getDatabaseSearchMovie(searchName){
    
    const db = dbClient.db("tnm115-project");
    const dbCollection = db.collection("movieDb");  

    console.log(searchName)

    const filterQuery = {"IMDb.name": { $regex: new RegExp(searchName, 'i') }};
    const sortQuery = {"IMDb.votes": -1};
    const projectionQuery = {_id: 0, IMDb: 1, bechdel: 1};
    const findResult = await dbCollection.find(filterQuery).sort(sortQuery).project(projectionQuery).limit(8).toArray();
    console.log("Found/Projected Documents:", findResult);

    return findResult;
}

async function getDatabaseId(searchID){
    
    const db = dbClient.db("tnm115-project");
    const dbCollection = db.collection("movieDb");  

    console.log(searchID)

    const filterQuery = {"IMDb._id": { $regex: new RegExp(searchID, 'i') }};
    const sortQuery = {_id: 1};
    const projectionQuery = {_id: 0, IMDb: 1, bechdel: 1};
    const findResult = await dbCollection.find(filterQuery).sort(sortQuery).project(projectionQuery).toArray();
    console.log("Found/Projected Documents:", findResult);

    return findResult;
}

async function getDatabaseRandom(random){
    const db = dbClient.db("tnm115-project");
    const dbCollection = db.collection("movieDb");

    const sortQuery = {"IMDb.votes": -1};
    const projectionQuery = {_id: 0, IMDb: 1, bechdel: 1};
    const findResult = await dbCollection.find().sort(sortQuery).project(projectionQuery).skip(random).limit(1).toArray();
    console.log("Found/Projected Documents:", findResult);
    return findResult;
}

// Function to recive movies from the database based on filter, sort and limit
async function getDatabase(sort, filter, limit, skipAmount, searchName){
    const db = dbClient.db("tnm115-project");
    const dbCollection = db.collection("movieDb");

    console.log("F: " + filter);
    console.log("Name: " + searchName);
    console.log("S:" + sort);

    let filterQuery = {};

    year = 1000;
    
    if(filter[0] == null){
        filterQuery = {};
        if (searchName) {
            console.log("SearchName3: " + searchName);
            filterQuery["IMDb.name"] = { $regex: new RegExp(searchName, 'i') };
        }
    }
    else {
        if (filter[0] === ""){
            filter[0] = 0;
        }
        if (filter[1] === ""){
            filter[1] = 2025;
        }

        let genres = [];
        console.log(filter[2]);
        if (filter[2] != undefined) {
            for (let i = 2; i < filter.length; i++){
                if (filter[i]){
                    genres.push(filter[i]);
                }
            }

            filterQuery = {
                "IMDb.year": {$gte: parseInt(filter[0]), $lte: parseInt(filter[1])},
                "IMDb.genre": {$all: genres}
            };

            if (searchName) {
                console.log("SearchName: " + searchName);
                filterQuery["IMDb.name"] = { $regex: new RegExp(searchName, 'i') };
            }
        } else {
            const allGenres = {$ne: ""};
            filterQuery = {
                "IMDb.year": {$gte: parseInt(filter[0]), $lte: parseInt(filter[1])},
                "IMDb.genre": allGenres
            };
            if (searchName) {
                console.log("SearchName2: " + searchName);
                filterQuery["IMDb.name"] = { $regex: new RegExp(searchName, 'i') };
            }
        }
        console.log(genres);
    }

    let sortQuery = {};
    if(sort == null){
        sortQuery = {"IMDb.votes": -1} ;
    }else if(sort == "bechdel"){
        sortQuery = {bechdel: -1};
    }else if(sort == "runtimeValue"){
        sortQuery = {runtimeValue: -1};
    }else {
        const s = "IMDb." + sort;
        sortQuery = {[s] : -1};
    }

    console.log(filterQuery)
    console.log(sortQuery)
    console.log("Skip: " + skipAmount)

    const projectionQuery = {_id: 0, IMDb: 1, bechdel: 1, runtimeValue: 1};
    const findLength = (await dbCollection.find(filterQuery).toArray()).length;
    const findResult = await dbCollection.find(filterQuery).sort(sortQuery).project(projectionQuery).skip(skipAmount).limit(limit).toArray();
    //console.log(findResult);
    return jsonResult = {length: findLength, data: findResult};
}