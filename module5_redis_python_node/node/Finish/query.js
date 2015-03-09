var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://127.0.0.1:27017/test';
var assert = require('assert');

MongoClient.connect(url, function(err, db) {

  //ensure we've connected
  assert.equal(null, err);

  var crimes = db.collection('crimes');
  //start timer
  console.time('query_time');

    crimes.find({"Primary Type": "ROBBERY"}, function(err, data){

        if(err){
          return console.error(err);
        }

        data.count(function(err, count){
          console.log('Total ROBBERY Crimes: ' + count);
          return console.timeEnd('query_time');
        });
    });
});
