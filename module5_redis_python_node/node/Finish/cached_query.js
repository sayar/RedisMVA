var redis = require("redis");
var client = redis.createClient();
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://127.0.0.1:27017/test';
var assert = require('assert');
MongoClient.connect(url, function(err, db) {

  //ensure we've connected
  assert.equal(null, err);

  var crimes = db.collection('crimes');

  //start timer
  console.time('query_time');

  client.get('longquery_result', function(err,count){

    if(err){
      return console.error(err);
    }

    if(!count){ //cache miss!
      crimes.find({"Primary Type": "ROBBERY"}, function(err, data){

        if(err){
          return console.error(err);
        }

        data.count(function(err, count){
          console.log('Total ROBBERY Crimes: ' + count);
          console.timeEnd('query_time');

          //cache into redis
          client.set('longquery_result', count, function(err){

            if(err){
              return console.error(err);
            }

            //expire query in 20 seconds
            client.expire('longquery_result', 20);
              
            console.log('sucessfully cached query');
            //close the database connection
            return db.close();
          
          });

        });

        
      });
      
    }
    else{ // cache hit!!
      console.log('Total ROBBERY Crimes: ' + count);
      console.timeEnd('query_time');
    }
  });
  
  	

});
