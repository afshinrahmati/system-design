# system-design
# Singleserversetup:
![Alt text](./single.png)
1. Users access websites through domain names, such as api.mysite.com. Usually, the
Domain Name System (DNS) is a paid service provided by 3rd parties and not hosted by
our servers.
2. Internet Protocol (IP) address is returned to the browser or mobile app. In the example,
IP address 15.125.23.214 is returned.
3. Once the IP address is obtained, Hypertext Transfer Protocol (HTTP) [1] requests are
sent directly to your web server.
4. The web server returns HTML pages or JSON response for rendering.
# Database
With the growth of the user base, one server is not enough, and we need multiple servers: one
for web/mobile traffic, the other for the database (Figure 1-3). Separating web/mobile traffic
(web tier) and database (data tier) servers allows them to be scaled independently.
1)  Data-tier ==> where the information that is processed by the application is stored and managed. 
## Which databases to use?
You can choose between a traditional relational database and a non-relational database. Let
us examine their differences.
1) Relational databases are also called a relational database management system (RDBMS).SQL DB
• store data in tables and rows
2) Non-Relational databases are also called NoSQL databases. Popular ones are CouchDB,
Neo4j, Cassandra, HBase, Amazon DynamoDB, etc. [2]. These databases are grouped into
four categories: key-value stores, graph stores, column stores, and document stores. Join
operations are generally not supported in non-relational databases.
• Your data are unstructured, or you do not have any relational data.
• You only need to serialize and deserialize data (JSON, XML, YAML, etc.).
• You need to store a massive(large) amount of data.