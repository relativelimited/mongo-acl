import {
    CollectionInsertOneOptions,
    FilterQuery,
    FindAndModifyWriteOpResultObject,
    FindOneAndReplaceOption,
    FindOneOptions,
    InsertOneWriteOpResult
} from "mongodb";

export type TSchema = any;

export interface Collection {
    findOne<T = TSchema>(filter: FilterQuery<TSchema>, options?: FindOneOptions): Promise<T | null>;

    findOneAndUpdate(filter: FilterQuery<TSchema>, update: Object, options?: FindOneAndReplaceOption): Promise<FindAndModifyWriteOpResultObject<TSchema>>;

    insertOne(docs: Object, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult>;
}

export interface Db {
    collection(name: string): Collection;
}