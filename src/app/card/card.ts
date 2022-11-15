export interface Icard {
    id: number | null,
    cardName: string,
    billDate: number,
    dueDate: number,
    amountDue: number,
    txns?: IcardTxn[]
}

interface IcardTxn {
    id: number,
    txnDate: string,
    amount: number,
    orderId: number,
    OrderName?: string
}