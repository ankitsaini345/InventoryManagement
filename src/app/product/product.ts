export interface IProduct {
    _id: string,
    name: string,
    date: string,
    ram: number,
    storage: number,
    AppName: string,
    AppAccount: string,
    listPrice: number,
    cardAmount: number,
    costToMe: number,
    buyerPrice: number,
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

export interface IProductStats {
    undeliveredCount: number,
    deliveredCount: number,
    OrderCount: number,
    buyerCount: number,
    undeliveredAmount: number,
    deliveredAmount: number,
    OrderAmount: number,
    buyerAmount: number
}