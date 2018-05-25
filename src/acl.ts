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
                const perm = doc.acl.find((p: PermissionObject) => p.name === permission);
                if (perm && perm.users) {
                    permitted = perm.users.indexOf(user) > -1;
                }
            }
            return permitted;
        }).catch(err => {
            return permitted;
        });
    }

    async filter(permission: string, model: string | Array<string>, user: string): Promise<string | Array<string> | null> {
        const models = ACL.arrayFromSingleOrArray(model);
        const responses: Array<Promise<void>> = [];
        const filteredModels: Array<string> = [];
        models.forEach(m => responses.push(this.userCan(permission, m, user).then((userCan) => {
            if (userCan){
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

    async grant(permission: string | Array<string>, model: string | Array<string>, user: string | Array<string>) {
        const models = ACL.arrayFromSingleOrArray(model);
        const users = ACL.arrayFromSingleOrArray(user);
        const permissions = ACL.arrayFromSingleOrArray(permission);
        const getPromises: Array<Promise<void>> = [];
        const setPromises: Array<Promise<ACLDocument>> = [];
        const modelACLs: Array<ACLDocument> = [];

        models.forEach(m => {
            getPromises.push(this.repo.getByID(m).then((doc: ACLDocument) => {
                const {acl} = doc;
                permissions.forEach(perm => {
                    if (acl.indexOf(perm) === -1) {
                        acl.push({
                            name: perm,
                            users: [],
                        });
                    }
                    users.forEach(user => {
                        const modelPermission = acl.find(p => p.name === perm);
                        if (!this.userCan(perm, m, user) && modelPermission) {
                            modelPermission.users.push(user);
                        }
                    });
                    modelACLs.push({
                        _id: m,
                        acl,
                        created: new Date().toISOString()
                    });
                });
            }).catch( () => {
                const doc: ACLDocument = {
                    _id: m,
                    acl: [],
                    created: new Date().toISOString()
                };
                const {acl} = doc;
                permissions.forEach(perm => {
                    if (acl.indexOf(perm) === -1) {
                        acl.push({
                            name: perm,
                            users: [],
                        });
                    }
                    users.forEach(user => {
                        const modelPermission = acl.find(p => p.name === perm);
                        if (!this.userCan(perm, m, user) && modelPermission) {
                            modelPermission.users.push(user);
                        }
                    });
                    modelACLs.push({
                        _id: m,
                        acl,
                        created: new Date().toISOString()
                    });
                });
            }));
        });
        Promise.all(getPromises).then(() => {
            modelACLs.forEach(doc => {
                setPromises.push(this.repo.save(doc));
            });
            Promise.all(setPromises).then(() => {
                if (model instanceof Array) {
                    return models[0];
                } else {
                    return models;
                }
            });
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

}