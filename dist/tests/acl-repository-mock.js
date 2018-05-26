"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ACLRepositoryMock {
    constructor(aclDocs) {
        this.aclDocs = aclDocs;
    }
    create(model) {
        this.aclDocs.push(model);
        return this.getByID(model._id);
    }
    delete(id) {
        return new Promise((resolve, reject) => {
            const doc = this.aclDocs.find(d => d._id === id);
            if (doc) {
                this.aclDocs.splice(this.aclDocs.indexOf(doc), 1);
                resolve(true);
            }
            else {
                reject(false);
            }
        });
    }
    getAll() {
        return new Promise((resolve) => {
            resolve(this.aclDocs);
        });
    }
    getByID(id) {
        return new Promise((resolve, reject) => {
            const doc = this.aclDocs.find(d => d._id === id);
            resolve(doc);
        });
    }
    save(model) {
        const doc = this.aclDocs.find(d => d._id === model._id);
        if (doc) {
            Object.assign(doc, model);
        }
        return this.getByID(model._id);
    }
}
exports.ACLRepositoryMock = ACLRepositoryMock;
