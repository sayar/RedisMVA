# Redis Publish-Subscribe

## Objectives

By the end of this module you will:

- Learn about publish-subscribe
- Learn about how to setup Redis for pub/sub
- How to consume and produce messages with Node.js

## Redis Publish-Subscribe

The publish-subscribe or pub/sub for short is a messaging pattern where there are multiple publishers sending messages to multiple subscribers listening for messages on specific channels through server software. It is one of the most common message queue patterns. Many systems have been created for this purpose among them Redis, RabbitMQ, Azure MessageBus and more... 

Redis, a high performance data structure store, has added support for pub/sub on top of its existing functionality. Redis pub/sub is built on three commands: `PUBLISH`, `SUBSCRIBE` and `UNSUBSCRIBE`. 

The `SUBSCRIBE` command lets a client subscribe to the channels passed to the command start receiving messages e.g. `SUBSCRIBE analytics` will subscribe the client to the analytics channel. 

The `UNSUBSCRIBE` command will unsubscribe the client from the specific channels.

All messages received take the form of a three element array. The first element is the kind of message: "subscribe", "unsubscribe" and "message". The "subscribe" message indicates if the client was successful in subscribing with the "unsubscribe" message indicating the opposite. The "message" message contains the payload sent to the channel with the `PUBLISH` command. 

Redis developers suggest for you to create separate clients for publishers and subscribers.

Redis Client #1:
```
> SUBSCRIBE analytics
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "analytics"
3) (integer) 1
```

Redis Client #2:
```
> PUBLISH analytics visit_page
(integer) 1
```

Redis Client #1:
```
1) "message"
2) "analytics"
3) "visit_page"
```

Redis pub/sub also has support for pattern matching when subscribing in clients. The `PSUBSCRIBE` command takes glob-style patterns. For example, if you wanted to subscribe to all messages on the "news." channel, you can use `PSUBSCRIBE news.*`. If you want to be more specific and only want to subscribe to art news, you can use `PSUBSCRIBE news.art`.

## Using Redis Publish-Subscribe with Node.js

To use the Redis pub/sub mechanism with node.js, the first thing you will want to do is select a native Redis client. The preferred node client is the [node_redis](https://github.com/mranney/node_redis) package.

The first thing you want to do is run `npm install redis` to install the node package into your project. 

Second, you want to require the node_redis project and create a Client for both the publisher and subscriber. Note, we are using the default client settings here. 

```js

var redis = require("redis");

var pub = redis.createClient();
var sub = redis.createClient();
```

Next, you want to set event handlers to the client to handle receiving messages and subscribe to the right channel.

```js

sub.on("subscribe", function(channel, count) {
	console.log("Subscribed to " + channel + ". Now subscribed to " + count + " channel(s).");
});

sub.on("message", function(channel, message) {
	console.log("Message from channel " + channel + ": " + message);
});

sub.subscribe("analytics");
```

Next, you want to set up the publisher to send messages on the channel.

```js
pub.publish("analytics", "page_viewed");
```

That's all you need to use Redis pub/sub!