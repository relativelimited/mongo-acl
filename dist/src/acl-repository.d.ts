import PermissionObject from "./permission-object-interface";
import { Repository, RepositoryDocument } from "mongo-repo-ts";
import { ACLRepositoryInterface } from "./acl-repository-interface";
export interface ACLDocument extends RepositoryDocument {
    acl: Array<PermissionObject>;
}
export declare class ACLRepository extends Repository<ACLDocument> implements ACLRepositoryInterface {
    constructor();
}
