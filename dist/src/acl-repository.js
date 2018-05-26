"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_repo_ts_1 = require("mongo-repo-ts");
class ACLRepository extends mongo_repo_ts_1.Repository {
    constructor() {
        super('acl', 'net.ookle.api.acl');
        this.increments = false;
    }
}
exports.ACLRepository = ACLRepository;
