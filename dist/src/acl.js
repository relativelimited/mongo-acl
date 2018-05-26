"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const acl_repository_1 = require("./acl-repository");
class ACL {
    constructor(repo) {
        this.repo = repo || new acl_repository_1.ACLRepository();
    }
    userCan(permission, model, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let permitted = false;
            return this.repo.getByID(model).then(doc => {
                if (doc) {
                    permitted = ACL.docHasPermissionFor(doc, permission, user);
                }
                return permitted;
            }).catch(err => {
                return permitted;
            });
        });
    }
    static docHasPermissionFor(doc, permission, user) {
        let permitted = false;
        const perm = doc.acl.find((p) => p.name === permission);
        if (perm && perm.users) {
            permitted = perm.users.indexOf(user) > -1;
        }
        return permitted;
    }
    filter(permission, model, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const models = ACL.arrayFromSingleOrArray(model);
            const responses = [];
            const filteredModels = [];
            models.forEach(m => responses.push(this.userCan(permission, m, user).then((userCan) => {
                if (userCan) {
                    filteredModels.push(m);
                }
            })));
            return Promise.all(responses).then(() => {
                if (model instanceof Array) {
                    return filteredModels;
                }
                else if (filteredModels.length > 0) {
                    return filteredModels[0];
                }
                else {
                    return null;
                }
            });
        });
    }
    static arrayFromSingleOrArray(object) {
        const objects = [];
        if (object instanceof Array) {
            objects.push(...object);
        }
        else {
            objects.push(object);
        }
        return objects;
    }
    grant(permission, model, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const models = ACL.arrayFromSingleOrArray(model);
            const users = ACL.arrayFromSingleOrArray(user);
            const perms = ACL.arrayFromSingleOrArray(permission);
            return this.repo.getAll({ _id: { $in: models } }).then((aclDocs) => {
                const saves = [];
                aclDocs.forEach(aclDoc => {
                    ACL.addPermissionForUserToDoc(aclDoc, perms, users);
                    saves.push(this.repo.save(aclDoc));
                });
                models.filter(m => !aclDocs.find(doc => doc._id === m)).forEach(m => {
                    const aclDoc = ACL.addPermissionForUserToDoc({
                        _id: m,
                        acl: [],
                        created: new Date().toISOString()
                    }, perms, users);
                    saves.push(this.repo.create(aclDoc));
                });
                return Promise.all(saves).then(result => {
                    return true;
                }).catch(() => false);
            }).catch((error) => {
                return false;
            });
        });
    }
    static addPermissionForUserToDoc(doc, permission, user) {
        const users = ACL.arrayFromSingleOrArray(user);
        const perms = ACL.arrayFromSingleOrArray(permission);
        users.forEach(u => {
            perms.forEach(perm => {
                if (!ACL.docHasPermissionFor(doc, perm, u)) {
                    const po = {
                        name: perm,
                        users: []
                    };
                    if (!ACL.aclHasPermission(doc.acl, perm)) {
                        doc.acl.push(po);
                    }
                    const permissionOb = ACL.aclHasPermission(doc.acl, perm) || po;
                    permissionOb.users.push(u);
                }
            });
        });
        return doc;
    }
    static aclHasPermission(acl, permission) {
        return acl.find(po => po.name === permission) || null;
    }
    revoke(permission, model, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const models = ACL.arrayFromSingleOrArray(model);
            const users = ACL.arrayFromSingleOrArray(user);
            const perms = ACL.arrayFromSingleOrArray(permission);
            return this.repo.getAll({ _id: { $in: models } }).then((aclDocs) => {
                const saves = [];
                aclDocs.forEach(aclDoc => {
                    ACL.removePermissionForUserFromDoc(aclDoc, perms, users);
                    saves.push(this.repo.save(aclDoc));
                });
                return Promise.all(saves).then(result => {
                    return true;
                }).catch(() => false);
            }).catch((error) => {
                return false;
            });
        });
    }
    static removePermissionForUserFromDoc(doc, permission, user) {
        const users = ACL.arrayFromSingleOrArray(user);
        const perms = ACL.arrayFromSingleOrArray(permission);
        users.forEach(u => {
            perms.forEach(perm => {
                if (ACL.docHasPermissionFor(doc, perm, u)) {
                    const po = {
                        name: perm,
                        users: []
                    };
                    const permissionOb = ACL.aclHasPermission(doc.acl, perm) || po;
                    permissionOb.users.splice(permissionOb.users.indexOf(u), 1);
                }
            });
        });
        return doc;
    }
    permissions(user, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const aclDoc = yield this.repo.getByID(model);
            const perms = [];
            if (aclDoc) {
                aclDoc.acl.forEach(permission => {
                    if (permission.users.indexOf(user) > -1) {
                        perms.push(permission.name);
                    }
                });
            }
            return perms;
        });
    }
}
exports.default = ACL;
