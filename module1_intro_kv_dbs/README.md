# Introduction to Key-value Databases

--------
## Objectives

By the end of this module, you will be able to understand the difference between key-value stores, structured databases and SQL databases.

## Introduction

[Key-Value Stores](http://en.wikipedia.org/wiki/NoSQL#Key-value_stores) are a type of data store that organize data differently from your traditional SQL store. The fundamental data model of a key-value store is the associative array (a.k.a. a map, a dictionary or a hash). It is a collection of key-value pairs where the key is unique in the collection. A key can be an ID or a name or anything you want to use as an identifier. The value can be anything. Rather than storing data into a variety of tables and columns like in SQL stores, key-value stores split a data model into a collection of data structures such as key-value strings, lists, hashes, sets, etc... Although it may sound simplistic, you can build  more complex data structures on top of key-values. 

Redis focuses on high performance and a simple querying language that is just a set of data retrieval commands (See Module 2). Unlike SQL, there are no worries about writing complex queries.

The nature of key-value stores makes them best suited to operate as caches or data structure stores and in situations that are performance sensitive. As previously mentioned, you can build more advanced data structures on top of key-value pairs. You can also use the high performance to build queues or publish-subscribe mechanisms (See Module 6).

Key-value stores fall into the NoSQL family of databases, they don't use SQL and have a flexible schema. Your application defines the key-value pairs and can change the definition at any time. You decide how to store your data!

## Tabular Structured Data vs Key-Value Structure

Lets look at an example of a bank, which keeps track of the following entities:

- **Person**
- **Account**

The basic relation here is that a **Person** can have many **Accounts** and therefore an **Account** has only one **Person**.

### Tabular Structure

Here's what this data may look like in a SQL database

**Persons:**


ID  | FIRST_NAME | LAST_NAME
------------- | ------------- | -------------
0  | Steven | Edouard
1 | Sam | Brightwood


**Accounts**

ID  | ACCOUNT_TYPE | ACCOUNT_BALANCE | CURRENCY | HOLDER (FK: Persons)
------------- | ------------- | ------------- | ------------- | -------------
0  | Investment | 80000.00 | USD | 0
1  | Savings | 70400.00 | USD | 0
2  | Checking | 4500.00 | USD | 0
3  | Checking | 4500.00 | YEN | 1
4  | Investment | 4500.00 | YEN | 1
5  | Savings | 4500.00 | YEN | 1

In the above data schema, the **HOLDER** field in the **Accounts** table is a **Foreign Key** into the **Accounts** table. This key is what creates the association between the two data entities. SQL requires that in order to create an Account, you must have a valid Foreign key that points to an existing person, which can cause some loss in flexibility.

With the schema above its easy to answer the question:

*Who is the account holder for the account with ID = 3?*

Because we have a foreign key HOLDER for the account we can quickly and easily look up that the account holder is **Sam Brightwood**. This is because there is a **many:one** relationship from Account entities and Person entities.

Now, how about the question:

*Which accounts does person Steven Edouard hold?*

To answer this question, it requires us to do a **join** which essentially is a set operation to find all of the rows in the **Accounts** table which match the Person ID = 0. This operation can become an expensive as the data in the tables grow in larger and larger numbers.

### Key-value Structure

In the key-value data structure, we want to reduce the Person table into a collection of keys and values that are identifiable by a Person ID. The key is an index in the key-value store, but we can add a second index embedded in the same key. For example, we want to take Person with ID=0 and store their first name, we can name our key: `0:first_name` or maybe `person:0:first_name` by using the ':' as an index separator in the key. If we follow this nomenclature of `table-name:key:property`, the above data can be flattened to the following key-value pairs. 

```
"person:0:first_name" = "Steven"
"person:0:last_name" = "Edouard"

"person:1:first_name" = "Sam"
"person:1:last_name" = "Brightwood"

"account:0:type" = "Investment"
"account:0:balance" = "80000.00"
"account:0:currency" = "USD"

"account:1:type" = "Savings"
"account:1:balance" = "70400.00"
"account:1:currency" = "USD"

"account:2:type" = "Checking"
"account:2:balance" = "80000.00"
"account:2:currency" = "USD"

"account:3:type" = "Checking"
"account:3:balance" = "4500.00"
"account:3:currency" = "YEN"

"account:4:type" = "Investment"
"account:4:balance" = "4500.00"
"account:4:currency" = "YEN"

"account:5:type" = "Savings"
"account:5:balance" = "4500.00"
"account:5:currency" = "YEN"
```

The data structure gets more interesting when we want to describe relationships like foreign keys. Our application layer will decide how to interpret the values and conceivably we can instruct the application to interpret values as a key:

```
"account:0:holder" = "person:0"
"account:1:holder" = "person:0"
"account:2:holder" = "person:0"
"account:3:holder" = "person:1"
"account:4:holder" = "person:1"
"account:5:holder" = "person:1"
```

Now, let's answer the original two questions again:

*Who is the account holder for account with ID = 3?*

To answer this question we can just look up the account holder with the unique ID 3, `account:3:holder` and by using the value `person:1`, we can easily pull out that user's name by appending `:first_name` to the value.

*Which accounts does person Steven Edouard hold?*

This is slightly more difficult. First, we will have to scan through all the person keys until we find a key that has both ```first_name="Steven"``` and ```last_name="Edouard"``. Secondly, once we locate that person, we will have to scan through all the account:*:holder keys until we find all those that are associated with the person:id key of Steven Edouard. 

Alternatively, we can create two reverse indices to speed up those two operations and not require any scans at all. We can add:

```
"person:name:edouard_steven" = "person:0"
"person:name:sam_brightwood" = "person:1"

"person:0:accounts" = "[account:0, account:1, account:2]"
"person:1:accounts" = "[account:3, account:4, account:5]"
```

Adding those two reverse indices, one to have a mapping between first_name & last_name and the key, second to have a mapping between a person and their accounts, allows us to answer our original question significantly faster than our initial approach. Fundamentally, how we store our data affects data retrieval in the key-value scenario.

Note: I am defining a scan here as reading through an array, an O(n) operation.

It seems like a lot more work to use a key-value database to store tabular data. In practice, the above operations are already abstracted away in a database like Redis through data types like hashes and lists.

## Where Key-Value Stores Shine?

The previous example was using a data model that was relational and shows key-value stores in not the best light. Well, all that doesn't matter when your data is by nature key-value pairs. A cache is a component that stores results so that they can be served faster in the future.

Let's say that you have to perform a long-running computation based on a key, for example: an encryption or a mathematical operation. You have calculated this computation once already; you want to keep it for the next time you need it, but you don't want to hold on to it for too long. This situation is where a key-value stores shine! The simplicity and the lack of overhead from a query system result in a very high-performance system 
