# Getting Started with Azure Redis Cache

## Objectives

By the end of this module you will:

- Learn about Azure Redis Cache
- Learn how to create a new cache in the azure portal. 
- Learn how to connect to your instance using the CLI.

## Azure Redis Cache

Microsoft Azure Redis Cache is based on the popular open source Redis Cache. It gives you access to a secure, dedicated Redis cache, managed by Azure. Any updates or patches to Redis is fully managed by Azure. A cache created using Azure Redis Cache is accessible from any application.


Microsoft Azure Redis Cache will be available in two tiers:
* Basic – Single node. Multiple sizes.
* Standard – Two-node Master/Slave. Includes SLA and replication support. Multiple Sizes.

Cache is available in sizes up to 53 GB.

Azure Redis Cache leverages Redis authentication and also supports SSL connections to Redis.


## Creating a New Cache

1. Sign into Azure
2. Navigate to the [Preview Portal](https://portal.azure.com)

![](1_portal_start.PNG)

3. Press the New button on the left bottom corner. 

![](2_portal_new.PNG)

4. Select the Data+Storage option in the Create blade and then select the Redis Cache option in the Data + Storage blade. 

![](3_portal_new_redis.PNG)

5. Name your New Redis Cache and select the size in the Pricing Tier option. Press create at the bottom when satisfied. 

![](4_select_size.PNG)

6. Go to the Startboard and wait for the new Redis Cache to be created. 

![](5_creating_new.PNG)


## Connecting to your Instance with Redis CLI

### Obtaining Your Connection Information

Click on the the newly created Redis Cache tile and select **'All Settings'**, then select **Properties**:

![](ss1.png)

Save the hostname somewhere we'll need that in a second. Back on the Settings blad click **Access Keys** option and copy the **Primary** key:


![](ss2.png)

Finally, we'll disable SSL, which is turned on by default. Redis clients may or may not support SSL. For example the Node.js client doesn't support SSL out of the box but [this fork](https://github.com/paddybyers/node_redis) has an implementation for, but the [Python redis client](https://github.com/andymccurdy/redis-py/) has support for this.

For the purposes of this Virtual Academy walk-through, we'll turn SSL off:

![](ss3.png)

### Connecting to the redis server

Finally to connect to the Azure Redis Instance you can execute this command:

```bash
$ redis-cli -h <redis-cache-name>.redis.cache.windows.net -p 6379 -a <your key>
```

This creates a connection to your azure redis instance and you can do any of the commands that you could do against your local instance.

```bash
someredis.redis.cache.windows.net:6379> GET somekey
(nil)
someredis.redis.cache.windows.net:6379> SET somekey 'some value'
OK
someredis.redis.cache.windows.net:6379> GET somekey
"some value"
```                                                             