import "mocha";
import ACL from "../src/acl";
import * as chai from "chai";
import {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {ACLRepositoryMock} from "./acl-repository-mock";

before(() => {
    chai.should();
    chai.use(chaiAsPromised);
});

describe('userCan', () => {
    it('should return false when no ACL exists', () => {
        const acl = new ACL(new ACLRepositoryMock([]));
        return acl.userCan('read', 'com.relativelimited.testobject.1', '123')
            .should.eventually.become(false);
    });

    it('should return false when no permission exists for the user in the ACL', () => {
        const acl = new ACL(new ACLRepositoryMock([
            {
                _id: "com.relativelimited.testobject.1",
                acl: [
                    {
                        name: "view",
                        users: ["98765432", "24681012"]
                    }
                ],
                created: new Date().toISOString()
            }
        ]));
        return acl.userCan("read", "com.relativelimited.testobject.1", "123")
            .should.eventually.become(false);
    });

    it('should return false when the user has other permissions but not the requested one', () => {
        const acl = new ACL(new ACLRepositoryMock([
            {
                _id: "com.relativelimited.testobject.1",
                acl: [
                    {
                        name: "view",
                        users: ["98765432", "24681012"]
                    }
                ],
                created: new Date().toISOString()
            }
        ]));
        return acl.userCan("amend", "com.relativelimited.testobject.1", "98765432")
            .should.eventually.become(false);
    });

    it('should return true when the user has the correct permission', () => {
        const acl = new ACL(new ACLRepositoryMock([
            {
                _id: "com.relativelimited.testobject.1",
                acl: [
                    {
                        name: "view",
                        users: ["98765432", "24681012"]
                    }
                ],
                created: new Date().toISOString()
            }
        ]));
        return acl.userCan("view", "com.relativelimited.testobject.1", "98765432")
            .should.eventually.become(true);
    });
});

describe('filter', () => {
    it('should return no results when the user has no permissions to read any of the models', () => {
        const acl = new ACL(new ACLRepositoryMock([]));
        const models = [
            "com.relativelimited.testobject.1",
            "com.relativelimited.testobject.2",
            "com.relativelimited.testobject.3"
        ];
        return acl.filter("view", models, "98765432")
            .should.eventually.become([]);
    });

    it('should return only results user has permissions to read', () => {
        const acl = new ACL(new ACLRepositoryMock([
            {
                _id: "com.relativelimited.testobject.1",
                acl: [
                    {
                        name: "view",
                        users: ["98765432", "24681012"]
                    }
                ],
                created: new Date().toISOString()
            },
            {
                _id: "com.relativelimited.testobject.2",
                acl: [
                    {
                        name: "view",
                        users: ["98765432", "24681012"]
                    }
                ],
                created: new Date().toISOString()
            },
        ]));
        const models = [
            "com.relativelimited.testobject.1",
            "com.relativelimited.testobject.2",
            "com.relativelimited.testobject.3"
        ];
        return acl.filter('view', models, '98765432')
            .should.eventually.contain("com.relativelimited.testobject.1")
            .and.contain("com.relativelimited.testobject.2")
            .and.not.contain("com.relativelimited.testobject.3");
    });
});

describe('grant', () => {
    it('should apply grants when no ACL exists', () => {
        const acl = new ACL(new ACLRepositoryMock([]));
        return acl.grant('read', 'com.relativelimited.testobject.1', '123')
            .should.eventually.equal(true);
    });

    it('should apply grants when ACL exists, but no permission exists for the user', () => {
        const acl = new ACL(new ACLRepositoryMock([
            {
                _id: "com.relativelimited.testobject.1",
                acl: [
                    {
                        name: "view",
                        users: ["98765432", "24681012"]
                    }
                ],
                created: new Date().toISOString()
            }
        ]));
        return acl.grant('read', 'com.relativelimited.testobject.1', '123')
            .should.eventually.equal(true);
    });

    it('should not duplicate permissions when permissions exist for user', async () => {
        const repo = new ACLRepositoryMock([
            {
                _id: "com.relativelimited.testobject.1",
                acl: [
                    {
                        name: "read",
                        users: ["98765432", "24681012", "123"]
                    }
                ],
                created: new Date().toISOString()
            }
        ]);
        const acl = new ACL(repo);
        const grantResult = await acl.grant('read', 'com.relativelimited.testobject.1', '123');
        expect(grantResult).to.equal(true);
        expect(repo.aclDocs[0].acl[0].users.length).to.equal(3);
    });

    it('should apply permission for user to multiple models simultaneously', async () => {
        const repo = new ACLRepositoryMock([]);
        const acl = new ACL(repo);
        const result = await acl.grant('view', ['com.relativelimited.testobject.1', 'com.relativelimited.testobject.2'], '123');
        expect(result).to.be.true;
        expect(repo.aclDocs.length).to.equal(2);
        expect(repo.aclDocs[0]._id).to.equal('com.relativelimited.testobject.1');
        expect(repo.aclDocs[0].acl[0].name).to.equal('view');
        expect(repo.aclDocs[0].acl[0].users).to.contain('123');
        expect(repo.aclDocs[1]._id).to.equal('com.relativelimited.testobject.2');
        expect(repo.aclDocs[1].acl[0].name).to.equal('view');
        expect(repo.aclDocs[1].acl[0].users).to.contain('123');
    });

    it('should apply permission for user to multiple models that already exist', async () => {
        const repo = new ACLRepositoryMock([{
            _id: "com.relativelimited.testobject.1",
            acl: [
                {
                    name: "view",
                    users: ["98765432", "24681012"]
                }
            ],
            created: new Date().toISOString()
        }, {
            _id: "com.relativelimited.testobject.2",
            acl: [
                {
                    name: "view",
                    users: ["98765432", "24681012"]
                }
            ],
            created: new Date().toISOString()
        }]);
        const acl = new ACL(repo);
        const result = await acl.grant('view', ['com.relativelimited.testobject.1', 'com.relativelimited.testobject.2'], '123');
        expect(result).to.be.true;
        expect(repo.aclDocs.length).to.equal(2);
        expect(repo.aclDocs[0]._id).to.equal('com.relativelimited.testobject.1');
        expect(repo.aclDocs[0].acl[0].name).to.equal('view');
        expect(repo.aclDocs[0].acl[0].users).to.contain('123');
        expect(repo.aclDocs[0].acl[0].users.length).to.equal(3);
        expect(repo.aclDocs[1]._id).to.equal('com.relativelimited.testobject.2');
        expect(repo.aclDocs[1].acl[0].name).to.equal('view');
        expect(repo.aclDocs[1].acl[0].users).to.contain('123');
        expect(repo.aclDocs[1].acl[0].users.length).to.equal(3);
    });

    it('should apply permission for user to multiple models that already exist and do not yet have the permission', async () => {
        const repo = new ACLRepositoryMock([{
            _id: "com.relativelimited.testobject.1",
            acl: [
                {
                    name: "view",
                    users: ["98765432", "24681012"]
                }
            ],
            created: new Date().toISOString()
        }, {
            _id: "com.relativelimited.testobject.2",
            acl: [
                {
                    name: "view",
                    users: ["98765432", "24681012"]
                }
            ],
            created: new Date().toISOString()
        }]);
        const acl = new ACL(repo);
        const result = await acl.grant('amend', ['com.relativelimited.testobject.1', 'com.relativelimited.testobject.2'], '123');
        const permissionToAmendObject1 = await acl.userCan('amend', 'com.relativelimited.testobject.1','123');
        const permissionToViewObject1 = await acl.userCan('view', 'com.relativelimited.testobject.1','123');
        const permissionToAmendObject2 = await acl.userCan('amend', 'com.relativelimited.testobject.2','123');
        const permissionToViewObject2 = await acl.userCan('view', 'com.relativelimited.testobject.2','123');
        result.should.be.true;
        permissionToAmendObject1.should.be.true;
        permissionToAmendObject2.should.be.true;
        permissionToViewObject1.should.be.false;
        permissionToViewObject2.should.be.false;
    });
});