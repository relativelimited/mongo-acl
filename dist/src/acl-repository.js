"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_repo_ts_1 = require("mongo-repo-ts");
class ACLRepository extends mongo_repo_ts_1.Repository {
    constructor() {
        super({
            collectionName: process.env['MONGO_ACL_COLLECTION'] || 'acl',
            modelRef: 'com.relativelimited.acl',
            mongoDBConnectionURI: process.env['MONGO_ACL_CONNECTION_URI'] || '',
            mongoDBDatabase: process.env['MONGO_ACL_DATABASE'] || '',
            increments: false
        });
    }
}
exports.ACLRepository = ACLRepository;
