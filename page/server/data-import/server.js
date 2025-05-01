// declaration and loading (inclusion) of various modules
const http = require("node:http");
const MongoClient = require("mongodb").MongoClient;

//MongoDB server
const dbHostname = "127.0.0.1";
const dbPort = 27017;
const dbServerUrl = "mongodb://" + dbHostname + ":" + dbPort + "";

// inizialize MongoDB connector instance
const dbClient = new MongoClient(dbServerUrl);

// initialization of server properties
const hostname = "127.0.0.1";
const port = 3000;
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
            const dbMovie = await getDatabaseSearch(searchPara);
            routing_data(res, JSON.stringify(dbMovie));
        }else{
            let db;
            if (pathComponents[1] == "null"){
                pathComponents[1] = null;
            } 
            if (pathComponents[2] == "null"){
                pathComponents[2] = null
            }


            db = await getDatabase(pathComponents[1], pathComponents[2],parseInt(pathComponents[3]));
            sendResponse(res, 200, "application/json", JSON.stringify(db));
        }    

            // const dbBechdel = await getDbBechdel();
            // /*routing_data(res, JSON.stringify(dbBechdel));*/
            // let dbImdb;
            // if(pathComponents[1] === 'undefined'){
            //     dbImdb = await getDbImdb(null,null);
            // }else {
            //     dbImdb = await getDbImdb(pathComponents[1],pathComponents[2]);
            // }
            
            // calc(dbBechdel,dbImdb);
            // console.log(Array.length)
            // console.log(dbBechdel[0].rating)

            // sendResponse(res, 200, "application/json", JSON.stringify(Array));
            // console.log(Array[0])

            //console.log(dbBechdel)
            //routing_data(res, JSON.stringify(dbImdb));
        
        
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
        /*console.log(1, movieJsonDataFromDb);
        console.log(movieJsonDataFromDb[0].normalized_id)*/

        sendResponse(res, 200, "application/json", jsonString);

    } catch (error) {
        // Handle JSON parsing error
        console.error("Error parsing JSON:", error);
        sendResponse(res, 500, "text/plain", "Internal Server Error");
    }
}

/*  These are the three different collections  
    const dbCollectionName_ActorInfo = db.collection("actorinfo");
    const dbCollectionName_bechdel = db.collection("bechdel");
    const dbCollectionName_imdb = db.collection("imdb");*/

// Function to recive movies from the database based on search criteria
async function getDatabaseSearch(searchName){
    
    const db = dbClient.db("tnm115-project");
    const dbCollection = db.collection("movieDb");  

    console.log(searchName)

    // '$regex' operator in MongoDB is used to search for specific strings in the collection
    // 'new RegExp' object is used for matching text with a pattern.
    // 'i' ensures that the search is case-insensitive, matching both uppercase and lowercase letters
    const filterQuery = {"IMDb.name": { $regex: new RegExp(searchName, 'i') }};
    const sortQuery = {name: 1};
    const projectionQuery = {_id: 0, IMDb: 1, bechdel: 1};
    const findResult = await dbCollection.find(filterQuery).sort(sortQuery).project(projectionQuery).toArray();
    console.log("Found/Projected Documents:", findResult);

    return findResult;
}

// Function to recive movies from the database based on filter, sort and limit
async function getDatabase(filter, sort, limit){
    const db = dbClient.db("tnm115-project");
    const dbCollection = db.collection("movieDb");

    console.log("F: " + filter);
    console.log("S:" + sort);

    let filterQuery = {};

    //Still under progress
    /*if(filter == null){
        filterQuery = {};
    }
    else {
        filterQuery = [filter] + ": 1";
    }*/

    let sortQuery = {};
    if(sort == null){
        console.log("S")
        sortQuery = {"IMDb.votes": -1} ;
        
    }
    else if(sort == "bechdel"){
        sortQuery = {bechdel: -1};
    } 
    else if(sort == "runtimeValue"){
        sortQuery = {runtimeValue: -1};
    }
    else {
        const s = "IMDb." + sort;
        sortQuery = {[s] : -1};
    }
    console.log(filterQuery)
    console.log(sortQuery)
    const projectionQuery = {_id: 0, IMDb: 1, bechdel: 1, runtimeValue: 1};
    const findResult = await dbCollection.find(filterQuery).sort(sortQuery).project(projectionQuery).limit(limit).toArray();
    console.log("Found/Projected Documents:", findResult);
    return findResult;
}

// async function getDbImdb(filter, sort){
    
//     const db = dbClient.db("tnm115-project");
//     const dbCollection = db.collection("imdb");

//     //const sortQuery = {votes: -1};
//     let n = 2 * 5;
//     /*.skip(n).limit(5)*/
//     const projectionQuery = { _id: 1, normalized_id: 1, name: 1, year: 1, runtime: 1, rating: 1, description: 1, votes: 1, director: 1, star: 1};
//     const findResult = await dbCollection.find(filterQuery).sort(sortQuery).project(projectionQuery).limit(10000).toArray();
//     //console.log("Found/Projected Documents:", findResult);
//     return findResult;
// }
/*  for search movie later
async function getDatabase(searchName){
    const db = dbClient.db("tnm115-project");
    const dbCollection = db.collection("bechdel");   

    const filterQuery = {name: searchName};
    const sortQuery = {name: 1};
    const findResult = await dbCollection.find(filterQuery).sort(sortQuery).toArray();
    //console.log("Found/Projected Documents:", findResult);
    return findResult;
}*/