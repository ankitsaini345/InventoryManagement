export interface IProduct {
    _id: string,
    name: string,
    date: string,
    ram: number,
    storage: number,
    AppName: string,
    AppAccount: string,
    listPrice: number | null,
    cardAmount: number,
    costToMe: number,
    buyerPrice: number | null,
    coupon: number,
    giftBalence: number,
    cardDiscount: number,
    cardHolder: string,
    deliveryDate: string,
    deliveryLoc: string,
    buyerDate:string,
    buyerName: string,
    status: string,
    profit: number,
    txnId: string,
    cashback: number,
    delivery: number
}