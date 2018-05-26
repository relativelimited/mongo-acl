import {ACLDocument, ACLRepository} from "./acl-repository";
import {ACLRepositoryInterface} from "./acl-repository-interface";
import PermissionObject from "./permission-object-interface";

export default class ACL {
    repo: ACLRepositoryInterface;

    constructor(repo?: ACLRepositoryInterface) {
        this.repo = repo || new ACLRepository();
    }

    async userCan(permission: string, model: string, user: string): Promise<boolean> {
        let permitted = false;
        return this.repo.getByID(model).then(doc => {
            if (doc) {
                permitted = ACL.docHasPermissionFor(doc, permission, user);
            }
            return permitted;
        }).catch(err => {
            return permitted;
        });
    }

    private static docHasPermissionFor(doc: ACLDocument, permission: string, user: string) {
        let permitted = false;
        const perm = doc.acl.find((p: PermissionObject) => p.name === permission);
        if (perm && perm.users) {
            permitted = perm.users.indexOf(user) > -1;
        }
        return permitted;
    }

    async filter(permission: string, model: string | Array<string>, user: string): Promise<string | Array<string> | null> {
        const models = ACL.arrayFromSingleOrArray(model);
        const responses: Array<Promise<void>> = [];
        const filteredModels: Array<string> = [];
        models.forEach(m => responses.push(this.userCan(permission, m, user).then((userCan) => {
            if (userCan) {
                filteredModels.push(m);
            }
        })));
        return Promise.all(responses).then(() => {
            if (model instanceof Array) {
                return filteredModels;
            } else if (filteredModels.length > 0) {
                return filteredModels[0];
            } else {
                return null;
            }
        });
    }

    private static arrayFromSingleOrArray(object: any) {
        const objects = [];
        if (object instanceof Array) {
            objects.push(...object);
        } else {
            objects.push(object);
        }
        return objects;
    }

    async grant(permission: string|Array<string>, model: string | Array<string>, user: string|Array<string>): Promise<boolean> {
        const models = ACL.arrayFromSingleOrArray(model);
        const users = ACL.arrayFromSingleOrArray(user);
        const perms = ACL.arrayFromSingleOrArray(permission);
        return this.repo.getAll({_id: {$in: models}}).then((aclDocs: Array<ACLDocument>) => {
            const saves: Array<Promise<ACLDocument>> = [];
            aclDocs.forEach(aclDoc => {
                ACL.addPermissionForUserToDoc(aclDoc, perms, users)
                saves.push(this.repo.save(aclDoc));
            });
            models.filter(m => !aclDocs.find(doc => doc._id === m)).forEach(m => {
                const aclDoc: ACLDocument = ACL.addPermissionForUserToDoc({
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
    }

    private static addPermissionForUserToDoc(doc: ACLDocument, permission: string|Array<string>, user: string|Array<string>): ACLDocument {
        const users = ACL.arrayFromSingleOrArray(user);
        const perms = ACL.arrayFromSingleOrArray(permission);
        users.forEach(u => {
            perms.forEach(perm => {
                if (!ACL.docHasPermissionFor(doc, perm, u)) {
                    const po: PermissionObject = {
                        name: perm,
                        users: []
                    };
                    if (!ACL.aclHasPermission(doc.acl, perm)) {
                        doc.acl.push(po);
                    }
                    const permissionOb: PermissionObject = ACL.aclHasPermission(doc.acl, perm) || po;
                    permissionOb.users.push(u);
                }
            });
        });
        return doc;
    }

    private static aclHasPermission(acl: Array<PermissionObject>, permission: string): PermissionObject | null {
        return acl.find(po => po.name === permission) || null;
    }

    async revoke(permission: string|Array<string>, model: string|Array<string>, user: string|Array<string>): Promise<boolean>
    {
        const models = ACL.arrayFromSingleOrArray(model);
        const users = ACL.arrayFromSingleOrArray(user);
        const perms = ACL.arrayFromSingleOrArray(permission);
        return this.repo.getAll({_id: {$in: models}}).then((aclDocs: Array<ACLDocument>) => {
            const saves: Array<Promise<ACLDocument>> = [];
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
    }

    private static removePermissionForUserFromDoc(doc: ACLDocument, permission: string|Array<string>, user: string|Array<string>): ACLDocument {
        const users = ACL.arrayFromSingleOrArray(user);
        const perms = ACL.arrayFromSingleOrArray(permission);
        users.forEach(u => {
            perms.forEach(perm => {
                if (ACL.docHasPermissionFor(doc, perm, u)) {
                    const po: PermissionObject = {
                        name: perm,
                        users: []
                    };
                    const permissionOb: PermissionObject = ACL.aclHasPermission(doc.acl, perm) || po;
                    permissionOb.users.splice(permissionOb.users.indexOf(u),1);
                }
            });
        });
        return doc;
    }

    async permissions(user: string, model: string): Promise<Array<string>> {
        const aclDoc = await this.repo.getByID(model);
        const perms: Array<string> = [];
        if (aclDoc){
            aclDoc.acl.forEach(permission => {
                if (permission.users.indexOf(user) > -1){
                    perms.push(permission.name);
                }
            });
        }
        return perms;
    }

}