# Advanced Data Structures with Redis

## Objectives

By the end of this module you will:

- Learn about advanced data structures in Redis
- Learn how to use hashes to store objects and other data models
- Learn about sets and sorted sets.
- Learn about bitmaps and hyperloglogs. 

## Hashes

Redis is often called a data structure store because it builds on top of the concept of key-value pairs to provide more advanced data structures like lists, hashes, sets, etc. We saw in the previous [module](https://github.com/sayar/RedisMVA/blob/master/module2_getting_started/README.md) that Redis supports lists as a data type for value and includes several specialized commands for dealing with lists. 

As we saw in the [first module](https://github.com/sayar/RedisMVA/blob/master/module1_intro_kv_dbs/README.md), we can decompose objects and complex data modules into a series of key-value pairs by using several indices in keys. Furthermore, you may have noticed that the tediousness of having to do execute multiple commands to make the jump. Luckily, Redis supports hashes which is the subject of this section.

Hashes are collections of key-value pairs. A hash serves as a map between a series of string keys and their associated string values. Thus they are the perfect representation of objects in your key-value store. 

The commands to get & set hashes follow a very similar pattern to what we have seen before. To create a hash, you can use the `HSET` command with a key for your hash and followed by a key-value pair (with `HSETNX` to set only if it doesn't already exist). To get a value in the hash, you can use the `HGET` command with the key for your hash and the key for the value. You can also GET & set multiple key-value pairs in your hash with the `HMGET` & `HMSET` command respectively. You can also use `HGETALL` to get all the key-value pairs in your hash.

Here is an example with the same data structure as in [Module 1](https://github.com/sayar/RedisMVA/blob/master/module1_intro_kv_dbs/README.md).

```
> HSET person:0 first_name "Rami"
(integer 1)
> HSET person:0 last_name "Sayar"
(integer 1)
> HMSET account:0 type "Investment" balance "1234" currency "USD"
OK
> HGET account:0 currency
"USD"
> HGETALL account:0
1) "type"
2) "Investment"
3) "balance"
4) "1234"
5) "currency"
6) "USD"
```

You can use `HINCRBY` or `HINCRBYFLOAT` to increment a string integer or float in a hash respectively. You can use `HLEN` to get the number of keys in a hash. You can use `HKEYS` or `HVALS` to get all the keys or values in a hash respectively. 

```
> HINCRBY account:0 balance 100
(integer) 1334
> HLEN account:0
(integer) 3
> HKEYS account:0
1) "type"
2) "balance"
3) "currency"
> HVALS account:0
1) "Investment"
2) "1334"
3) "USD"
```

To delete a field in a hash, you can use the command `HDEL` with the key of the hash. To check if a field in a hash already exists, you can use `HEXISTS`. 

```
> HEXISTS account:0 balance
(integer) 1
> HDEL account:0 balance
(integer) 1
> HEXISTS account:0 balance
(integer) 0
```

## Sets

Redis sets are unordered collections of Strings. They are similar to lists but have the desirable property of ensuring every member is unique. It is possible to add the same element multiple times without needing to check if it already exists as if it does, nothing will happen. You can add, remove and test the existence of members in constant time.

Sets allow you to do interesting operations with other sets such as unions, intersections and differences. If you are familiar with Set Theory, we are applying the same mathematical operations. You can perform these operations directly on the database as opposed to in the application code. 

The commands to create sets are a little different than the previous pattern. To add a member to a set you have to use the `SADD` command, to remove a member the `SREM` command, to check if a member already exists the `SISMEMBER` command and to get the members of a set the `SMEMBERS` command. 

```
> SADD countries "Canada"
(integer) 1
> SADD countries "Canada"
(integer) 0
> SADD countries "USA"
(integer) 1
> SMEMBERS countries
1) "USA"
2) "Canada"
> SREM countries "USA"
(integer) 1
> SMEMBERS countries
1) "Canada"
```

To get the difference between multiple sets you can use the `SDIFF` command. To get the difference and store the results in a new set, you can use the `SDIFFSTORE`. To find out if a multiple sets intersect, you can use the `SINTER` command, the equivalent command but also stores the results is `SINTERSTORE`. 

You can also get a random member from the set by using `SRANDMEMBER`. To get a member and also remove it from the set, you can use `SPOP`.

Read more [here](http://redis.io/commands#set).

## Sorted Sets

Redis sorted sets are similar to regular sets with one major difference; members of the set are given a rank that determines their position in the set. Immediately, you can use Redis to handle situations like leaderboards in your games or task priority queues that other databases cannot. 

In softed sets, members are automatically sorted by their rank and although the members must be unique, their rank not. Since members are ordered immediately as they are added to the set, the performance for adding, removing or updating members is faster of O(log(n)). You can retrieve elements by position or rank. 

The commands to create sorted sets are a little different than the previous pattern but similar to set commands. To add a member to a sorted set you have to use the `ZADD` command along with a score, to remove a member the `ZREM` command, to check if a member already exists or get the score the `ZSCORE` command and to get the members of a set the `ZRANGE` command. 

You can also run operations like unions and intersections. 

Sorted sets have the unique ability to be able to retrieve and remove elements based on their lexicographical ordering or their rank or their score. You can read more about it [here](http://redis.io/commands#sorted_set). 

## Bitmaps

Bitmaps are not data types in Redis so much as they are bit operations you can run on a string. You can count the number of bits set to 1, perform AND, OR, XOR and NOT operations, and find the first bit of a specific value. To set & get bits, you can use the `SETBIT` and `GETBIT` commands respectively, both allow you to offset the bit you are operating on. To perform a bit-wise operation, you can use the `BITOP AND`, `BITOP OR`, `BITOP XOR`, `BITOP NOT` commands with a result destination key set as the first parameter and all other keys containing values following, e.g. `BITOP AND destkey srckey1 ... srckeyN`. `BITCOUNT` counts the number of bits set to 1. `BITPOS` finds the first bit with a value of 0 or 1. 

The support for bitmaps and the subsequent operations you can perform on bits are typically not found in databases. 

## HyperLogLogs 

HyperLogLogs are an interesting data structure, designed to count unique elements. Counting unique element is incredibly important for analytics e.g. web analytics, etc. The magic of HyperLogLogs is that you do not need to keep a copy of all the members to ensure  you do not count members multiple times. HyperLogLogs will give you an estimate along with a standard error. You can thus use HyperLogLogs as a running estimate of your analytics in a cache while offloading the true calculations to another system or database to be performed over time. 

The commands to use with HyperLogLogs are fairly straightforward. You use `PFADD` to count new elements and you use `PFCOUNT` to retrieve the current approximation of unique elements. That's it. 

P.S. Currently, the standard error estimation is close to 1%.

This is the end of Module 3.