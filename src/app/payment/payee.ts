export interface IPayee {
    _id: string,
    name: string,
    totalAmount: number,
    lastPaymentDate: string,
    pendingComm: number,
    lastPaymentNum: number,
    lastPaidAmount: number,
    tillDate: number
}