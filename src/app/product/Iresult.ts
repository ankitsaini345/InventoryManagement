export interface Iresult {
    acknowledged: boolean,
    deletedCount?: number,
    insertedId?: string,
    matchedCount?:number,
    modifiedCount?:number
}