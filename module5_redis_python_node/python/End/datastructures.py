import redis
r = redis.StrictRedis(host="localhost", port=6379, db=0)
r.hset("person:0", "first_name", "Rami")
r.hset("person:0", "last_name", "Edouard")
# now print the hset
print r.hgetall("person:0")
r.hmset("person:1", {"first_name":"Rami", "last_name":"Edouard", "location":"CANADA"})
print r.hgetall("person:1")

# Sets
print "Creating a set of countries in redis..."
r.sadd("countries", "USA")
r.sadd("countries", "Canada")
r.sadd("countries", "Mexico")
print "Getting contry set from redis..."
print r.smembers("countries")
