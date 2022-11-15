export interface Icard {
    id: number | null,
    cardName: string,
    billDate: number,
    dueDate: number,
    amountDue: number,
    txns?: IcardTxn[]
}

export interface IcardTxn {
    id?: number | null,
    txnDate: string,
    amount: number | null,
    orderId: number | null,
    OrderName?: string
}