export interface RepositoryInterface<RepositoryDocument> {
    getByID(id: string): Promise<T>;

    getAll(): Promise<Array<T>>;

    save(model: T): Promise<T>;

    create(model: T): Promise<T>;

    delete(id: string): Promise<boolean>;
}

export interface RepositoryDocument {
    _id: string;
    created: string;
}