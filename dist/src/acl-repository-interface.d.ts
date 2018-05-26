import { RepositoryInterface } from "mongo-repo-ts";
import { ACLDocument } from "./acl-repository";
export interface ACLRepositoryInterface extends RepositoryInterface<ACLDocument> {
}
