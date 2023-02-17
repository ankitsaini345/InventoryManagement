export interface IPayment {
    _id: string,
    name: string,
    amount: number,
    type: string,
    date: string,
    percent?: number,
    paymentMode: string,
    receiver: string,
    prevAmount: number,
    remAmount: number,
    remark: string,
    count: number,
    lastPayDate: string,
    cashback: number,
    pendingCommision: number
}