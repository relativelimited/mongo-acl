# MongoDB Access Control Lists
## Summary
A user-level ACL implementation in TypeScript using a MongoDB back-end.

Grant permissions for models/documents/resources to individual users, instead of groups/roles.

## Installation

```
npm install mongo-acl --save
```

First, you need a working MongoDB cluster. You'll also need to create a collection in your database, called `acl`, or
 you can give it a different name, and specify this using environment variables (see below).

Define the following environment variables to configure ACL with MongoDB:
- `MONGO_ACL_CONNECTION_URI` - this is the connection string for your MongoDB cluster
- `MONGO_ACL_DATABASE` - the name of the MongoDB Database to use

Optionally, you can also override the default collection:
- `MONGO_ACL_COLLECTION` - the name of the collection to store the ACL documents in (defaults to 'acl')

e.g.
```
export MONGO_ACL_CONNECTION_URI=mongodb://localhost:27017/my_db
export MONGO_ACL_DATABASE=my_db
export MONGO_ACL_COLLECTION=access
```

## Usage

Permissions are just strings which can represent, perhaps CRUD operations like `read`, `write`, `delete` etc... or 
more fine-grained controller actions such as `postComments`, `publish` etc...

Model references are also strings, and I recommend you use something like a namespaced model e.g. `com
.relativelimited.blog.post.123` or perhaps a URI `/blog/posts/123`.

Users are strings representing the user ID.

### Instantiate a new ACL object
```
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
```
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

acl.grant(permissions, docs, users).then( () => {
    // Permissions granted
}).catch( error => {
    // handle error
});
```
You can also grant a single permission, to a single user, on a single document:
```
acl.grant('amend','com.example.doc.123','1828282').then(() => {
    // Permission granted
}).catch(error=>{
    // handle error
});
```

### Revoke Permissions
Revoking permissions works exactly the same as granting them. You can revoke one or more permissions from one or more
 users to one or more models/resources.
 
```typescript
acl.revoke('amend','com.example.doc.123','12345678').then(()=>{
    // permission revoked
}).catch(error => {
    // handle error
})
```

### View Permissions
You can view the permissions a user has on a model/resource
```typescript
const permissions = await acl.permissions('12345678','com.example.doc.123');
/* Returns:
 * ['view','amend'];
 */
```

## ACL Documents

ACL Documents are stored in MongoDB like this:
```
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