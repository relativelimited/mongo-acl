import {MongoClient,} from "mongodb";
import {RepositoryDocument, RepositoryInterface} from "./repositoryInterface";

export default class Repository<T extends RepositoryDocument> implements RepositoryInterface<RepositoryDocument> {
    collectionName: string;
    db: any;

    constructor(collectionName: string) {
        this.collectionName = collectionName;
    }

    async getByID(id: string): Promise<T> {
        const db = await this.getDb();
        return db.collection(this.collectionName).findOne({_id: id});
    }

    async getAll(query?: T): Promise<Array<T>> {
        const q = query || {};
        const db = await this.getDb();
        const results: Array<T> = await db.collection(this.collectionName).find(q).toArray();
        const inc = results.find(item => item._id === '__incrementer');
        if (inc) {
            results.splice(results.indexOf(inc), 1);
        }
        return results;
    }

    async save(model: T): Promise<T> {
        const db = await this.getDb();
        if (!model._id || model._id.length === 0) {
            throw new Error('Model ID not set');
        }
        const response = await db.collection(this.collectionName).findAndModify(
            {_id: model._id},
            [],
            model,
            {
                upsert: true,
            }
        );

        return response.value;
    }

    async create(model: T): Promise<T> {
        const db = await this.getDb();
        if (!model._id || model._id.length === 0) {
            model._id = await this.setID();
        }
        model.created = new Date().toISOString();

        const response = await db.collection(this.collectionName).insertOne(
            model
        );

        if (!response.result.ok) {
            throw new Error('Unabled to insert');
        }

        return response.ops[0];
    }

    async delete(id: string): Promise<boolean> {
        const db = await this.getDb();
        const response = await db.collection(this.collectionName).remove({_id: id});

        if (response.result.n > 0) {
            return true;
        }

        throw new Error('Not Found');
    }

    private async getDb() {
        if (!this.db) {
            const client = await MongoClient.connect(process.env['MONGO_DB_CONNECTION_URI'] || '');
            this.db = client.db(process.env['MONGO_DB_DATABASE'] || '');
        }
        return this.db;
    }

    private async setID() {
        const db = await this.getDb();
        const output = await db.collection(this.collectionName).findAndModify(
            {_id: "__incrementer"},
            [],
            {$inc: {"seq": 1}},
            {
                upsert: true,
                new: true
            }
        );
        return output.value.seq;
    }
}