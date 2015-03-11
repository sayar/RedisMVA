# Redis via Node.js and Python

## Objective

By the end of this module you'll know how to:

- Install the Redis Driver for Node.js
- Install the Redis Driver for Python
- Manipulate Redis Data Structures in Python
- Cache a Query's results into Redis in Node
- Count the Number of Unique IPs that Visited your site in Node

## Introduction

As we've learned in Module [2]() and [3]() Redis is a feature-packed cache with pub/sub capabilities along with advanced data structures that can keep application information.

In this module, we'll use Redis via Node.js and Python Drivers in a variety of examples which show off how we can use some Redis features.

## Getting Started

Before you get started with this session, you'll need to install a few things:

- [MongoDB](https://www.mongodb.org/downloads)
- [Node.js](https://nodejs.org/download/)
- [Python](https://www.python.org/downloads/) (Comes installed with Node.js)

You can also install all of these things with either [Homebrew](http://brew.sh) for OSX or [Chocolatey](https://chocolatey.org) for Windows package managers which makes installation and updating very easy.

## Redis Commands with Python

With Python we'll show you how to use the `redis-py` client to manipulate a few Redis data structures.

#### Getting Started

To install the Redis client go ahead and execute:

```bash
# linux/mac
sudo pip install redis
# windows
pip install redis
```

Create a new python file so we can get up an running with Redis called `datastructures.py` with the following import:

```py
import redis
r = redis.StrictRedis(host="localhost", port=6379, db=0)
```

Going forward the [Python Redis Client](https://redis-py.readthedocs.org/en/latest/index.html?highlight=mapping) implements nearly all the native redis commands.

#### Hashes

Continuing from the examples in Module [2](../module2_getting_started/README.md) and [3](../module3_getting_started/README.md) we can access redis' HSET command right from the redis client object:

```py
import redis
r = redis.StrictRedis(host="localhost", port=6379, db=0)
print "Creating Key first_name"
r.hset("person:0", "first_name", "Rami")
print "Creating Key last_name"
r.hset("person:0", "last_name", "Edouard")
# now print the hset
print hgetall("person:0")
```

The python script creates a new `person` hash with an `id` of 0 with both the `first_name` and `last_name` fields set.

Just as on the command line, doing a GETALL will retrieve the entire hash set:

```bash
$ python datastructures.py
{'first_name': 'Rami', 'last_name': 'Edouard'}
```

#### Multiple HashSets

Using the `client.hmset` function we can set a batch of key-value mappings for a hash set and send it all at once to redis, instead of sending one at a time. This really brings up the performance of you redis calls by reducing the overhead of an indivdual interaction with redis.

```py
print "Creating a batch mapping of keys first_name, last_name and location"
r.hmset("person:1", {"first_name":"Rami", "last_name":"Edouard", "location":"CANADA"})
print r.hgetall("person:1")
```

#### Sets

Sets are just as easy to manipulate. Let's go off the [Sets example](https://github.com/sayar/RedisMVA/blob/master/module3_adv_datastructures/README.md#sets) from the previous section. If we wanted to create a set with the names of countries we can easily do that with the `setadd` function:

```py
print "Creating a set of countries in redis..."
r.sadd("countries", "USA")
r.sadd("countries", "Canada")
r.sadd("countries", "Mexico")
print "Getting contry set from redis..."
print r.smembers("countries")
```

Here is the quick output that you'll get from running the above lines:

```
Creating a set of countries in redis...
Getting contry set from redis...
set(['Canada', 'USA', 'Mexico']
```


## Caching Queries (Node.js)

One scenario why using Redis and any other cache is storing the results of common queries for a limited amount of time for fast recall.

For example, a long running query that may be common to many users of your application can be cached so that the result is much quicker for most who ask for the query.

### The Crime Data Set

We're going to build off of our previous [MongoDB MVA example dataset](https://github.com/sedouard/mongodb-mva/tree/master/module4_advanced_data_ops#the-example-data-set) and use it to run a long running query. You don't need to know much about MongoDB but in order to run example you'll have to [download and install MongoDB](https://www.mongodb.org/downloads). 

### Loadup the Data

Once you're running locally we'll go ahead and download [the dataset](https://mongdbmva.blob.core.windows.net/csv/crimedata.csv.zip) and quickly load up that .csv file with `mongoimport` which comes installed with MongoDB.

```bash
mongoimport Crimes_-_2001_to_present.csv --type csv --headerline --collection crimes
```

This dataset contains about 5 million entries and represents crimes that have occurred in Chicago since 2001.

A typical record in this database looks like:

```json
{ "_id" : ObjectId("5462725476ecd357dbbc721e"), "ID" : 9844675, "Case Number" : "HX494115", "Date" : "11/03/2014 11:51:00 PM", "Block" : "056XX S MORGAN ST", "IUCR" : 486, "Primary Type" : "BATTERY", "Description" : "DOMESTIC BATTERY SIMPLE", "Location Description" : "ALLEY", "Arrest" : "false", "Domestic" : "true", "Beat" : 712, "District" : 7, "Ward" : 16, "Community Area" : 68, "FBI Code" : "08B", "X Coordinate" : 1170654, "Y Coordinate" : 1867165, "Year" : 2014, "Updated On" : "11/10/2014 12:43:02 PM", "Latitude" : 41.790980835, "Longitude" : -87.649786614, "Location" : "(41.790980835, -87.649786614)" }
```

#### Querying the Database

Now that we have the data up in Mongo let's make a quick app that will query this data. We'll call this `query.js`.

```js
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
```

We won't go into too much detail about how the MongoDB stuff works. If you want more detail there, just check out our [MongoDB language drivers walk-through](https://github.com/sedouard/mongodb-mva/tree/master/module3_language_drivers).

Because this query is querying on an un-indexed field - `Primary Type`, over 5 million records this can take a while. Run the following commands to run `query.js`:

```bash
# install mongodb language driver
# Creates a package.json package manifest for you
npm init
...
# Answer all the questions or use defaults npm provides
npm install mongodb --save
# run the application
node query.js
Total ROBBERY Crimes: 212034
query_time: 15701ms
```

Notice how long the query took - 15 seconds! This was on a cold start on our machine and subsequent times may take around 2-3 seconds:

```bash
Total ROBBERY Crimes: 212034
query_time: 2757ms
```


#### Caching the Query Result

Either way, 2.7 seconds for a query is quite long for a user to have to wait especially if this is a commonly accessed query. We can save the result of this query into Redis with a [TTL](http://en.wikipedia.org/wiki/Time_to_live) on the data so that the data is not only stored for fast access later, but also available for any other user who needs that same exact query.

First we'll add the redis Node.js language driver:

```bash
npm install redis --save
```

Now, create a new file called `cached_query.js` next to `query.js` and copy the contents of `query.js` into `cached_query.js` to get things started.

Add the redis client by adding a `require` to the `redis` module and calling the `createClient` function on it:

```js
var redis = require("redis");
var client = redis.createClient();
```

Now, we can use the `client.set` function to store something in the redis cache. We can use this to stash the result of the query count:

```js
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
```

Now the result of the query has been stored into the key `longquery_result`. Reis stores all of its values as strings, so for exmaple if you wanted to store a javascript object you'd have to use `JSON.stringify` to properly store it into redis.

The `client.expire` function will attach a TTL of 20 seconds to the data which will cause redis to delete the stored value after an elapsed time of 20 seconds.

Now, when we attempt to run the query, we need to first attempt to fetch the data out of redis before actually running the query on MongoDB. We'll add this right after we start the query timer:

```js
client.get('longquery_result', function(err,count){
	if(err){
		//unexpected redis error
		return console.error(err);
	}
	
	if(!count){ //cache miss!
		//run long running query on MongoDB
	}
	else{ //cache hit!
		console.log('Total ROBBERY Crimes: ' + count);
		console.timeEnd('query_time');
	}
	
	
});
```

We can see that the `client.get` function callback takes the standard `err` as the first parameter and the value of the key as the second parameter, in our case we call this `count`.

If the `count` variable is defined, we know we got the data and can quickly return it to the user. Otherwise we'll have to actually run the query on MongoDB.

Finally the entire `cached_query.js` looks like the following:


```js
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
```

Now lets checkout the advantage of caching the query:

```bash
# Ran the first time:
$ node cached_query.js 
Total ROBBERY Crimes: 212034
query_time: 3911ms
sucessfully cached query
# Ran the second time:
$ node cached_query.js 
Total ROBBERY Crimes: 212034
query_time: 0ms
# Ran the third time:
$ node cached_query.js
Total ROBBERY Crimes: 212034
query_time: 1ms
# Ran after 20 seconds:
Total ROBBERY Crimes: 212034
query_time: 2380ms
sucessfully cached query
```

So we can see that the first time our app does the query it takes a long time, in our case about 3.9 seconds. After caching into Redis it takes .01-.02 seconds a tremedous improvement because we don't actually have to run the query and redis holds the information in-memory for fast retrieval. Finally after the data expires, in our case a 20 second TTL the query s ran again and takes a long time.

The important thing to highlight is that these cached key-values can be shared amongst all your servers in your deployment and therefore these performance gains can be experienced by any of your users.

## Counting the Unique Number of IP Addresses that Connect to Our Site (Node.js)

An interesting Feature of Redis is the algorithm [HyperLogLog](http://en.wikipedia.org/wiki/HyperLogLog) as a datastructure. It's an ingenious way to approximate count the number of unique items, without actually having to store what those items are. Traditionally this would require you to utilize an amount of space proportional to the number of unique items you need to calculate.

Redis exposes HyperLogLog as a datastructure where you simply have to add a value to a key and redis will keep track of how many unique items you've added to that collection with a < 1% error.

### Creating a quick web server

In order to do this we'll need to quickly create a web app. From the [node.js homepage](http://nodejs.org) we can copy the standard 'Hello World' server:

```js
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
```
### Counting Unique Clients with Redis
Now let's add our redis client as before

```js
var redis = require("redis");
var client = redis.createClient();
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
```

We can use the http `req.connection.remoteAddress` variable to get the client's IP address:

```js
var redis = require("redis");
var client = redis.createClient();
var http = require('http');
http.createServer(function (req, res) {
  client.pfadd('clientips', req.connection.remoteAddress, function(err){
        if(err){
          return res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('Error talking to redis ' + err + '\n');
        }

        client.pfcount('clientips', function(err, count){
                res.writeHead(500, {'Content-Type': 'text/plain'});
                return res.end('Hello ' + req.connection.remoteAddress + '\n about ' + count + ' unique connections have visited this site!');
        });
  });


}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
```

Running this you should see the following output:

```bash
$ curl http://localhost:1337
Hello 127.0.0.1
about 1 unique connections have visited this site!
```

### Deploying

We absolutley need to have this deployed to a cloud service provider in order for the app to actually count the number of unique clients. Let's do this by quickly creating an azure site and deploying. First intiialize an azure website, setup source control deployment and copy your git url. You can use [this guide](http://azure.microsoft.com/en-us/documentation/videos/create-a-nodejs-site-deploy-from-github/) which walks you through the process.

Add to your `package.json` in the `scripts` object a `start` field:

```json
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node count_server.js"
  },
```

This will tell websites to start the website using that command.

We'll have to tell the driver that it needs to connect to an azure redis cache instead of hte local one. We can do this by adding the credentials to the redis client.

```js
var client = redis.createClient(6379, "<redis cache name>.redis.cache.windows.net", {auth_pass: '<password>', return_buffers: true});
```


Initialize your git repository, add azure as a remote with the git publish link you got from azure websites:

```bash
# initialize git repo
git init
# create a .gitignore and exclude the node modules repo
echo node_modules >> .gitignore
# add everything to the repo
git add .
# commit
git commit . -m 'initial commit'
# add the azure remote
git remote add azure <your azure git url>
# push to azure websites
git push azure master
```

You'll see the node pacakges get installed and you site deployed.

Finally visit your website and have a friend visit it. You should see the following output on your browser:

```
Hello 208.72.141.54:54160
 about 5 unique connections have visited this site!
```

Because the app is deployed to a publicly accessible location you can now count the number of unique connections from clients anywhere on the web!


