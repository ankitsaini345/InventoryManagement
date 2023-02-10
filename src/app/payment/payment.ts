export interface IPayment {
    _id: string,
    name: string,
    amount: number,
    date: string,
    percent?: number,
    paymentMode: string,
    receiver: string
}