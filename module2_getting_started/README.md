# Getting Started with Redis

## Objectives

By the end of this module you will:

- Know how to install, setup and run Redis on your local machine.
- Learn how to use common commands
- Learn about Redis Data Types
- Learn about Strings and Lists
- Learn about Expiration

## Getting Started

The first thing you need to do is install Redis for your specific system. On Windows, Redis is supported by the [MSOpenTech](https://msopentech.com/) team that keeps a 64-bit port. You can download it from [here](https://github.com/MSOpenTech/redis/releases/tag/win-2.8.17.4).

Redis on Windows has achieved performance nearly identical to the POSIX version. Redis on Windows uses the IO Completion Port model. For the most part, none of the changes in the Windows port will impact the developer experience.

You should unzip Redis such that you have it in a folder that is in your `PATH` environment variable if you plan on using the Redis through a terminal. Alternatively, you can run Redis as a service with the Windows Services model. 

### Running Redis

Once you have extracted Redis, you can open up a console, navigate to that folder and simply execute the redis-server.exe with a configuration file.

`redis-server redis.windows.conf`

This command will start the Redis server on port 6379.

In the configuration file, you can find settings to change the port, bind to an IP or hostname, specify TCP keepalive settings, set the log file and more importantly set the settings for when Redis should snapshot the DB to disk. If you are using Redis only as a cache, you will not need to save to disk as that is a slow operation with an impact on performance. 

### Installing Redis as a Service

To install Redis as a service, you have to execute the `--service-install` command along with a Redis config file. 

`redis-server --service-install redis.windows.conf`

Following a successful installation, you can start the service by running the `--service-start` command. 

`redis-server --service-start`

To stop the service, you can run the `--service-stop` command. 

`redis-server --service-stop`

You can also give an optional name to your service if you plan on running separate instances of Redis. Just add the `--service-name NAME` command to the install command and use the service-name to reference the specific service you want to start or stop. Make sure you also specific a different port for each Redis server. 

```
redis-server --service-install --service-name cache1 --port 3001
redis-server --service-start --service-name cache1
redis-server --service-stop --service-name cache1
```

## Redis Client & SET/GET

Once you've got `redis-server` started, you can use the `redis-cli` to connect to your server and do some basic commands. Simply executing `redis-cli` will connect you using the default ports and parameters as set in `redis.windows.conf`. 

If you remember from Module 1, Redis is a key-value store and the basics of the data model are storing key and value pairs. We can retrieve the values only if we know the exact key. The command to store the key-value pair is `SET`.

`SET key "value"` or `SET person:1:first_name "Rami"`  

The client will print `OK` if the command is executed successfully.

To retrieve the value stored for the above key, you use the `GET` command. 

`GET key` or `GET person:1:first_name`

The above will print `"Rami"` if executed successfully.

Note: the quotation marks are not stored with the value.

## A Walkthrough of Common Commands

Let us walk through some common Redis commands. First is `DEL` which serves to remove a key-value pair from the store. Second is `SETNX` which performs a `SET` command only on condition that the key-value pair does not already exist in the store. `APPEND` serves to append to your value. `INCR` and `DECR` serve to increment and decrement the integer value of a key. These two commands bring up the question of "what data types are supported as values?". We will answer that question shortly. 

Let us run a series of commands and see what the output is:

```
> SET sales_count 10
OK
> INCR sales_count
(integer) 11
> INCR sales_count
(integer) 12
> DEL sales_count
(integer) 1
> INCR sales_count
(integer) 1
```

Notice the last increment is done on a key that has already been deleted which results in a new key being created increment from a value of zero.

## Data Types Supported

Redis supports multiple ways to manipulate values as you can see by the `INCR` and `DECR` operators in the previous section. The most basic Redis value is a string. Strings are binary safe so you can insert any kind of value you want so long as the maximum size does not surpass 512 MB. This is a hard limit. You can treat strings as numbers hence the `INCR` and `DECR` but you can also treat them as bits (`GETBIT` & `SETBIT`) or as random access arrays (`GETRANGE` & `SETRANGE`). 

There are also other data types that we will cover mostly in the next module. Those data types include lists, sets, sorted sets, hashes, bitmaps and hyperloglogs. 

## On Redis Keys

Redis keys are just strings but they are also binary-safe. An empty string is also a valid key but typically you want to to use keys that describe the value well enough and  are not too long. Typically you want to stick to a self-defined schema. For instance, "object-type:id" is a good idea but if you don't like the ':' separator, '-' & '.' are frequently used.

You can determine if a key exists by simply using the `EXISTS` command.

TODO: ADD RENAME.

## Lists

Redis also supports lists of strings. You can create a list by using the command `LPUSH` or `RPUSH` which prepend a value to a list or append a value to a list. If you had an `X` to the end of either command, it would only do that operation if the list already exists. The command `LPOP` removes the first element in a list and removes it, `RPOP` does the same for the last element. Thus you can see the beginnings of a queue. 

```
> LPUSH countries "Canada"
(integer) 1
> LPUSH countries "USA"
(integer) 2
> RPUSH countries "Japan"
(integer) 3
> RPUSH countries "France"
(integer) 4
> RPOP countries
"France"
```

You can also treat lists as random access. You can use `LINDEX` to get an element from a list by its index and you can get the length of the list by using the `LLEN` command. You can also use `LINSERT` to insert an element in the list after a specific element or use `LSET` to modify a value in a list at that index. You can use `LRANGE` to get a range of elements and `LTRIM` to remove a range of elements. `RPOPLPUSH` removes the last element in a list and prepends it to another list.

```
> LLEN countries
(integer) 3
> LRANGE countries 0 3
1) "USA"
2) "Canada"
3) "Japan"
> LRANGE countries 0 -1
1) "USA"
2) "Canada"
3) "Japan"
> LINDEX countries 2
"Japan"
> LINSERT countries before "Canada" "Armenia"
(integer) 4
> LSET countries 0 "Argentina"
OK
> LRANGE countries 0 -1 
1) "Argentina"
2) "Armenia"
3) "Canada"
4) "Japan"
```

Furthermore, you can turn lists into a queuing system with blocking until elements are available by adding the `B` symbol before `LPOP` or `RPOP`. You can also go further into the queueing commands by using `BRPOPLPUSH` which first performs a pop from one list, a push to the another while the returning the value and block if there is no value to be found. You can use this complex command to take a value from a `work` queue to put into a `completed` queue. 

## Querying for Keys

Typically, you should not querying for keys in production as it tends to deteriorate performance when the store has huge numbers of keys. 

There are two ways to query for keys, first is by using the `KEYS` command which takes a pattern that can contain glob-style patterns. The complexity for this operation is O(N) which means you should be using this in production. `SCAN` is the preferred way to query for keys, in essence, its a cursor based iterator just like in programming languages such as Python or Java or other databases like MongoDB or SQL databases. The `SCAN` command has several options and supporting commands which you can explore [here](http://redis.io/commands/scan).

In most cases, you want to avoid querying for keys, you can use sets (which will be explained in the next module) to keep a unique list of keys.

## Adding Expirations to Keys

As mentioned in Module 1, Redis is best used as a cache yet one of the principles of a cache is that key-value pairs expire after a certain amount of time. We will cover how you can set the expiration of a key in this section.

Using the `EXPIRE key ttl` command with a time-to-live in seconds will set the key expiration. Redis stores the expiration as absolute Unix timestamps so even if the store goes down, when it goes back up it will expire the key. 

If you no longer want to have an expiration, you can use the `PERSIST` command to remove it.

If you want to find out how much time is left before expiration, you can use the `TTL` command to find out.

```
> SET mykey "Hello"
OK
> EXPIRE mykey 10
(integer) 1
> TTL mykey
(integer) 10
```

This ends Module 2. 