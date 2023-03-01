export class Order {
    constructor(input) {
        this.customerId = input.customerId;
        this.productList = input.productList;
        this.status = -1;
        this.weight = 0;
    }

    setWeight(products) {
        for (const product in this.productList) {
            this.weight += products[product] * this.productList[product];
        }
        this.weight /= 1000;
    }

    changeStatys(status) {
        this.status = status;
    }
}