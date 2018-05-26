import PermissionObject from "./permission-object-interface";
import {Repository, RepositoryDocument} from "mongo-repo-ts";
import {ACLRepositoryInterface} from "./acl-repository-interface";

export interface ACLDocument extends RepositoryDocument {
    acl: Array<PermissionObject>;
}

export class ACLRepository extends Repository<ACLDocument> implements ACLRepositoryInterface {

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