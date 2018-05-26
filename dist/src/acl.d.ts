import { ACLRepositoryInterface } from "./acl-repository-interface";
export default class ACL {
    repo: ACLRepositoryInterface;
    constructor(repo?: ACLRepositoryInterface);
    userCan(permission: string, model: string, user: string): Promise<boolean>;
    private static docHasPermissionFor(doc, permission, user);
    filter(permission: string, model: string | Array<string>, user: string): Promise<string | Array<string> | null>;
    private static arrayFromSingleOrArray(object);
    grant(permission: string | Array<string>, model: string | Array<string>, user: string | Array<string>): Promise<boolean>;
    private static addPermissionForUserToDoc(doc, permission, user);
    private static aclHasPermission(acl, permission);
    revoke(permission: string | Array<string>, model: string | Array<string>, user: string | Array<string>): Promise<boolean>;
    private static removePermissionForUserFromDoc(doc, permission, user);
    permissions(user: string, model: string): Promise<Array<string>>;
}
