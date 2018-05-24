# MongoDB Access Control Lists
## Installation
First, you need a working MongoDB cluster. Set the `MONGO_DB_CONNECTION_URI` environment variable, and the 
`MONGO_DB_DATABASE` environment variable, e.g.
```$xslt
export $MONGO_DB_CONNECTION_URI=mongodb://localhost:27017/my_db
export $MONGO_DB_DATABASE=my_db
```

You'll need to create a collection in your database, called `acl`.

Now, install mongo-acl with:
```$xslt
npm install mongo-acl --save
```

## Summary
A user-level ACL implementation in TypeScript using a MongoDB back-end.

Grant permissions for models/documents/resources to individual users, instead of groups/roles.

## Usage

Permissions are just strings which can represent, perhaps CRUD operations like `read`, `write`, `delete` etc... or 
more fine-grained controller actions such as `postComments`, `publish` etc...

Model references are also strings, and I recommend you use something like a namespaced model e.g. `com
.relativelimited.blog.post.123` or perhaps a URI `/blog/posts/123`.

Users are strings representing the user ID.

### Instantiate a new ACL object
```$xslt
const acl = new ACL(new ACLRepository());
```
You pass an ACLRepository into the constructor which allows the ACL to access MongoDB. 

### Check if a user has permission
```$js
acl.userCan('read','com.example.object.1','user123').then( userCan => {
    if (userCan){
        // do something
    } else {
        // respond 403
    }
});
```

### Filter a list of documents according to whether the user can see them or not
```$js
const docs = [
    'com.example.blog.posts.101',
    'com.example.blog.posts.102',
    'com.example.blog.posts.103',
    'com.example.blog.posts.104',
    'com.example.blog.posts.105',
];

acl.filter('read', docs, 'user123').then(visibleDocs => {
    // return visibleDocs
});
```

### Grant Permission(s) on model(s) to user(s)
```$xslt
const permissions = [
    'document.view',
    'document.amend',
    'document.redact'
];
const docs = [
    'com.example.documentapi.document.1284',
    'com.example.documentapi.document.1285',
    'com.example.documentapi.document.1286',
    'com.example.documentapi.document.1287',
];
const users = [
    '1248179812',
    '1241927446',
    '1981724987',
    '1189749871',
];

acl.grant(permissions, docs, users).then( d => {
    // d is an array of document IDs which now have permissions set
});
```
You can also grant a single permission, to a single user, on a single document:
```
acl.grant('amend','com.example.doc.123','1828282').then(d => {
    // d is 'com.example.doc.123'
});
```

## ACL Documents

ACL Documents are stored in MongoDB like this:
```$xslt
_id: 'com.example.doc.123',
acl: [
    {
        name: 'view',
        users: [
            '12894798',
            '09128490',
            '01897408'
        ]
    },
    {
        name: 'amend',
        users: [
            '01897408'
        ]
    }
],
created: '2018-05-01T08:00:00.000Z'
```