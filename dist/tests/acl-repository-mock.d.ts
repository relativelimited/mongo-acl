import { ACLDocument } from "../src/acl-repository";
import { ACLRepositoryInterface } from "../src/acl-repository-interface";
export declare class ACLRepositoryMock implements ACLRepositoryInterface {
    aclDocs: Array<ACLDocument>;
    constructor(aclDocs: Array<ACLDocument>);
    create(model: ACLDocument): Promise<ACLDocument>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<Array<ACLDocument>>;
    getByID(id: string): Promise<ACLDocument>;
    save(model: ACLDocument): Promise<ACLDocument>;
}
