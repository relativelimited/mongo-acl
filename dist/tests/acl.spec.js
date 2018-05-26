"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const acl_1 = __importDefault(require("../src/acl"));
const chai = __importStar(require("chai"));
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const acl_repository_mock_1 = require("./acl-repository-mock");
before(() => {
    chai.should();
    chai.use(chai_as_promised_1.default);
});
describe('userCan', () => {
    it('should return false when no ACL exists', () => {
        const acl = new acl_1.default(new acl_repository_mock_1.ACLRepositoryMock([]));
        return acl.userCan('read', 'com.relativelimited.testobject.1', '123')
            .should.eventually.become(false);
    });
    it('should return false when no permission exists for the user in the ACL', () => {
        const acl = new acl_1.default(new acl_repository_mock_1.ACLRepositoryMock([
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
        const acl = new acl_1.default(new acl_repository_mock_1.ACLRepositoryMock([
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
        const acl = new acl_1.default(new acl_repository_mock_1.ACLRepositoryMock([
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
        const acl = new acl_1.default(new acl_repository_mock_1.ACLRepositoryMock([]));
        const models = [
            "com.relativelimited.testobject.1",
            "com.relativelimited.testobject.2",
            "com.relativelimited.testobject.3"
        ];
        return acl.filter("view", models, "98765432")
            .should.eventually.become([]);
    });
    it('should return only results user has permissions to read', () => {
        const acl = new acl_1.default(new acl_repository_mock_1.ACLRepositoryMock([
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
        const acl = new acl_1.default(new acl_repository_mock_1.ACLRepositoryMock([]));
        return acl.grant('read', 'com.relativelimited.testobject.1', '123')
            .should.eventually.equal(true);
    });
    it('should apply grants when ACL exists, but no permission exists for the user', () => {
        const acl = new acl_1.default(new acl_repository_mock_1.ACLRepositoryMock([
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
    it('should not duplicate permissions when permissions exist for user', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([
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
        const acl = new acl_1.default(repo);
        const grantResult = yield acl.grant('read', 'com.relativelimited.testobject.1', '123');
        chai_1.expect(grantResult).to.equal(true);
        chai_1.expect(repo.aclDocs[0].acl[0].users.length).to.equal(3);
    }));
    it('should apply permission for user to multiple models simultaneously', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([]);
        const acl = new acl_1.default(repo);
        const result = yield acl.grant('view', ['com.relativelimited.testobject.1', 'com.relativelimited.testobject.2'], '123');
        chai_1.expect(result).to.be.true;
        chai_1.expect(repo.aclDocs.length).to.equal(2);
        chai_1.expect(repo.aclDocs[0]._id).to.equal('com.relativelimited.testobject.1');
        chai_1.expect(repo.aclDocs[0].acl[0].name).to.equal('view');
        chai_1.expect(repo.aclDocs[0].acl[0].users).to.contain('123');
        chai_1.expect(repo.aclDocs[1]._id).to.equal('com.relativelimited.testobject.2');
        chai_1.expect(repo.aclDocs[1].acl[0].name).to.equal('view');
        chai_1.expect(repo.aclDocs[1].acl[0].users).to.contain('123');
    }));
    it('should apply permission for user to multiple models that already exist', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([{
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
        const acl = new acl_1.default(repo);
        const result = yield acl.grant('view', [
            'com.relativelimited.testobject.1',
            'com.relativelimited.testobject.2'
        ], '123');
        chai_1.expect(result).to.be.true;
        chai_1.expect(repo.aclDocs.length).to.equal(2);
        chai_1.expect(repo.aclDocs[0]._id).to.equal('com.relativelimited.testobject.1');
        chai_1.expect(repo.aclDocs[0].acl[0].name).to.equal('view');
        chai_1.expect(repo.aclDocs[0].acl[0].users).to.contain('123');
        chai_1.expect(repo.aclDocs[0].acl[0].users.length).to.equal(3);
        chai_1.expect(repo.aclDocs[1]._id).to.equal('com.relativelimited.testobject.2');
        chai_1.expect(repo.aclDocs[1].acl[0].name).to.equal('view');
        chai_1.expect(repo.aclDocs[1].acl[0].users).to.contain('123');
        chai_1.expect(repo.aclDocs[1].acl[0].users.length).to.equal(3);
    }));
    it('should apply permission for user to multiple models that already exist and do not yet have the permission', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([{
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
        const acl = new acl_1.default(repo);
        const result = yield acl.grant('amend', [
            'com.relativelimited.testobject.1',
            'com.relativelimited.testobject.2'
        ], '123');
        const permissionToAmendObject1 = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '123');
        const permissionToViewObject1 = yield acl.userCan('view', 'com.relativelimited.testobject.1', '123');
        const permissionToAmendObject2 = yield acl.userCan('amend', 'com.relativelimited.testobject.2', '123');
        const permissionToViewObject2 = yield acl.userCan('view', 'com.relativelimited.testobject.2', '123');
        result.should.be.true;
        permissionToAmendObject1.should.be.true;
        permissionToAmendObject2.should.be.true;
        permissionToViewObject1.should.be.false;
        permissionToViewObject2.should.be.false;
    }));
    it('should apply permission for multiple users to one model', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([]);
        const acl = new acl_1.default(repo);
        const result = yield acl.grant('amend', 'com.relativelimited.testobject.1', ['123', '234']);
        const user1Permission = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '123');
        const user2Permission = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '234');
        result.should.be.true;
        user1Permission.should.be.true;
        user2Permission.should.be.true;
    }));
    it('should apply permission for multiple users to multiple models', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([]);
        const acl = new acl_1.default(repo);
        const result = yield acl.grant('amend', ['com.relativelimited.testobject.1', 'com.relativelimited.testobject.2'], ['123', '234']);
        const user1Permission1 = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '123');
        const user2Permission1 = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '234');
        const user1Permission2 = yield acl.userCan('amend', 'com.relativelimited.testobject.2', '123');
        const user2Permission2 = yield acl.userCan('amend', 'com.relativelimited.testobject.2', '234');
        result.should.be.true;
        user1Permission1.should.be.true;
        user2Permission1.should.be.true;
        user1Permission2.should.be.true;
        user2Permission2.should.be.true;
    }));
    it('should apply multiple permissions for a user to a model', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([]);
        const acl = new acl_1.default(repo);
        const result = yield acl.grant(['view', 'amend'], 'com.relativelimited.testobject.1', '123');
        result.should.be.true;
        const userCanViewObject = yield acl.userCan('view', 'com.relativelimited.testobject.1', '123');
        const userCanAmendObject = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '123');
        userCanViewObject.should.be.true;
        userCanAmendObject.should.be.true;
    }));
    it('should apply multiple permissions for multiple users to multiple models', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([]);
        const acl = new acl_1.default(repo);
        const result = yield acl.grant(['view', 'amend'], ['com.relativelimited.testobject.1', 'com.relativelimited.testobject.2'], ['123', '234']);
        result.should.be.true;
        const user1CanViewObject1 = yield acl.userCan('view', 'com.relativelimited.testobject.1', '123');
        const user1CanViewObject2 = yield acl.userCan('view', 'com.relativelimited.testobject.2', '123');
        const user1CanAmendObject1 = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '123');
        const user1CanAmendObject2 = yield acl.userCan('amend', 'com.relativelimited.testobject.2', '123');
        const user2CanViewObject1 = yield acl.userCan('view', 'com.relativelimited.testobject.1', '234');
        const user2CanViewObject2 = yield acl.userCan('view', 'com.relativelimited.testobject.2', '234');
        const user2CanAmendObject1 = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '234');
        const user2CanAmendObject2 = yield acl.userCan('amend', 'com.relativelimited.testobject.2', '234');
        user1CanViewObject1.should.be.true;
        user1CanAmendObject1.should.be.true;
        user1CanViewObject2.should.be.true;
        user1CanAmendObject2.should.be.true;
        user2CanViewObject1.should.be.true;
        user2CanAmendObject1.should.be.true;
        user2CanViewObject2.should.be.true;
        user2CanAmendObject2.should.be.true;
    }));
});
describe('revoke', () => {
    it('should remove a single permission for a single user from a single model', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([{
                _id: "com.relativelimited.testobject.1",
                acl: [
                    {
                        name: "view",
                        users: ["98765432", "24681012", "123"]
                    }
                ],
                created: new Date().toISOString()
            }]);
        const acl = new acl_1.default(repo);
        let permission = yield acl.userCan('view', 'com.relativelimited.testobject.1', '123');
        permission.should.be.true;
        const result = yield acl.revoke('view', 'com.relativelimited.testobject.1', '123');
        result.should.be.true;
        permission = yield acl.userCan('view', 'com.relativelimited.testobject.1', '123');
        permission.should.be.false;
    }));
    it('should remove a multiple permissions for a single user from a single model', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([{
                _id: "com.relativelimited.testobject.1",
                acl: [
                    {
                        name: "view",
                        users: ["98765432", "24681012", "123"]
                    },
                    {
                        name: "amend",
                        users: ["98765432", "24681012", "123"]
                    }
                ],
                created: new Date().toISOString()
            }]);
        const acl = new acl_1.default(repo);
        let permission = yield acl.userCan('view', 'com.relativelimited.testobject.1', '123');
        permission.should.be.true;
        permission = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '123');
        permission.should.be.true;
        const result = yield acl.revoke(['view', 'amend'], 'com.relativelimited.testobject.1', '123');
        result.should.be.true;
        permission = yield acl.userCan('view', 'com.relativelimited.testobject.1', '123');
        permission.should.be.false;
        permission = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '123');
        permission.should.be.false;
    }));
    it('should remove a singe permission for a single user from a single model, leaving their other permissions intact', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([{
                _id: "com.relativelimited.testobject.1",
                acl: [
                    {
                        name: "view",
                        users: ["98765432", "24681012", "123"]
                    },
                    {
                        name: "amend",
                        users: ["98765432", "24681012", "123"]
                    }
                ],
                created: new Date().toISOString()
            }]);
        const acl = new acl_1.default(repo);
        let permission = yield acl.userCan('view', 'com.relativelimited.testobject.1', '123');
        permission.should.be.true;
        permission = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '123');
        permission.should.be.true;
        const result = yield acl.revoke('amend', 'com.relativelimited.testobject.1', '123');
        result.should.be.true;
        permission = yield acl.userCan('view', 'com.relativelimited.testobject.1', '123');
        permission.should.be.true;
        permission = yield acl.userCan('amend', 'com.relativelimited.testobject.1', '123');
        permission.should.be.false;
    }));
});
describe('permissions', () => {
    it('should return a list of only the permissions the user has on the given model', () => __awaiter(this, void 0, void 0, function* () {
        const repo = new acl_repository_mock_1.ACLRepositoryMock([{
                _id: "com.relativelimited.testobject.1",
                acl: [
                    {
                        name: "view",
                        users: ["98765432", "24681012", "123"]
                    },
                    {
                        name: "amend",
                        users: ["98765432", "24681012", "123"]
                    }
                ],
                created: new Date().toISOString()
            }, {
                _id: "com.relativelimited.testobject.2",
                acl: [
                    {
                        name: "list",
                        users: ["98765432", "24681012", "123"]
                    },
                    {
                        name: "execute",
                        users: ["98765432", "24681012", "123"]
                    }
                ],
                created: new Date().toISOString()
            }]);
        const acl = new acl_1.default(repo);
        const permissions = yield acl.permissions('123', 'com.relativelimited.testobject.1');
        permissions.length.should.equal(2);
        permissions.should.contain('view').and.contain('amend').and.not.contain('list').and.not.contain('execute');
    }));
});
