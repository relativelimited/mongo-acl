import Repository from "./repository";
import PermissionObject from "./permission-object-interface";
import {RepositoryDocument, RepositoryInterface} from "./repositoryInterface";
import {ACLRepositoryInterface} from "./acl-repository-interface";

export interface ACLDocument extends RepositoryDocument{
    acl: Array<PermissionObject>;
}

export class ACLRepository extends Repository<ACLDocument> implements ACLRepositoryInterface{

    constructor(){
        super('acl');
    }
}