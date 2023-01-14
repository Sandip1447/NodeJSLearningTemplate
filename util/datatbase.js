const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient;

// connect to database

let _db;

const mongoConnect = (callback) => {
    mongoClient.connect('mongodb+srv://node-learning:ghXeXmNN9QgFJyas@learning.viy5zbu.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            console.log('connected')
            _db = client.db();
            console.log(client);
            callback();
        }).catch(err => {
        console.log(err);
        throw err;
    })
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;