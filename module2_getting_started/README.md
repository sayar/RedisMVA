# Getting Started with Redis

## Objectives

By the end of this module you will know how to:

- Install, setup and run Redis on your local machine.

## Getting Started

The first thing you need to do is install Redis for your specific system. On Windows, Redis is supported by the [MSOpenTech](https://msopentech.com/) team that keeps a 64-bit port. You can download it from [here](https://github.com/MSOpenTech/redis/releases/tag/win-2.8.17.4).

Redis on Windows has achieved performance nearly identical to the POSIX version. Redis on Windows uses the IO Completion Port model. For the most part, none of the changes in the Windows port will impact the developer experience.

You should unzip Redis such that you have it in a folder that is in your `PATH` environment variable if you plan on using the Redis through a terminal. Alternatively, you can run Redis as a service with the Windows Services model. 

### Running Redis

Once you have extracted Redis, you can open up a console, navigate to that folder and simply execute the redis-server.exe with a configuration file.

`redis-server redis.windows.conf`

This will start the Redis server on port 6379.

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

## Redis Client

TODO: Continue here.
