import {ACLDocument} from "../src/acl-repository";
import {ACLRepositoryInterface} from "../src/acl-repository-interface";

export class ACLRepositoryMock implements ACLRepositoryInterface {
    aclDocs: Array<ACLDocument>;

    constructor(aclDocs: Array<ACLDocument>) {
        this.aclDocs = aclDocs;
    }

    create(model: ACLDocument): Promise<ACLDocument> {
        this.aclDocs.push(model);
        return this.getByID(model._id);
    }

    delete(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const doc = this.aclDocs.find(d => d._id === id);
            if (doc) {
                this.aclDocs.splice(this.aclDocs.indexOf(doc), 1);
                resolve(true);
            } else {
                reject(false);
            }
        })
    }

    getAll(): Promise<Array<ACLDocument>> {
        return new Promise<Array<ACLDocument>>((resolve) => {
            resolve(this.aclDocs);
        });
    }

    getByID(id: string): Promise<ACLDocument> {
        return new Promise<ACLDocument>((resolve, reject) => {
            const doc = this.aclDocs.find(d => d._id === id);
            if (doc) {
                resolve(doc);
            } else {
                reject(null);
            }
        });
    }

    save(model: ACLDocument): Promise<ACLDocument> {
        const doc = this.aclDocs.find(d => d._id === model._id);
        if (doc) {
            Object.assign(doc, model);
        }
        return this.getByID(model._id);
    }

}