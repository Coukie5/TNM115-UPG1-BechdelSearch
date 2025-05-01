const MongoClient = require("mongodb").MongoClient;

//MongoDB server
const dbHostname = "127.0.0.1";
const dbPort = 27017;
const dbServerUrl = "mongodb://" + dbHostname + ":" + dbPort + "";

// inizialize MongoDB connector instance
const dbClient = new MongoClient(dbServerUrl);

let Array = [];
importDB();

async function importDB(){
    dbClient.connect();
    const db = dbClient.db("tnm115-project");
    const bechDbCollection = db.collection("bechdel");
    const imdbDbCollection = db.collection("imdb");

    const beProjectionQuery = { _id: 1, normalized_imdb_id: 1, title: 1, rating: 1};
    const imProjectionQuery = { _id: 1, normalized_id: 1, name: 1, year: 1, runtime: 1, genre: 1,rating: 1, description: 1, votes: 1, director: 1, star: 1};

    const beArr = await bechDbCollection.find({}).project(beProjectionQuery).toArray();
    const imArr = await imdbDbCollection.find({}).project(imProjectionQuery).toArray();

    combineDB(beArr, imArr);

    console.log(Array.length);
    db.createCollection("movieDb");
    const collection = db.collection("movieDb");
    collection.insertMany(Array);
}


function combineDB(be, im){
    Array = [];
    console.log(be.length);
    console.log(im.length)
    for(let i = 0; i < im.length; i++){
        for(let j = 0; j < be.length; j++){
            if(im[i].normalized_id === be[j].normalized_imdb_id){
                if(im[i].runtime){
                    let pathComponents = (im[i].runtime).split(" ");
                    Array.push({IMDb: im[i], bechdel: be[j].rating, runtimeValue: parseInt(pathComponents[0], 10)});
                }else{
                    Array.push({IMDb: im[i], bechdel: be[j].rating});
                    console.log(im[i]);
                }
            }
        }
    }  
}