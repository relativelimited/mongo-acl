import "mocha";
import ACL from "../src/acl";
import * as chai from "chai";
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