export interface Icard {
    _id: string,
    cardName: string,
    cardNumber: string,
    billDate: number,
    dueDate: number,
    amountDue: number,
    totalAmount: number,
    unbilledAmount: number,
    lastBilledMonth: number
}

