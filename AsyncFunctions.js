export async function checkFileForInput(input = [], timeDelay) {
    const result = await fetch('./input3.json');
    const data = await result.json();
    if (input.orders.length == data.orders.length) {
        setTimeout(checkFileForInput(input, timeDelay), timeDelay);
        return;
    }

    let isNewOrder = false;
    for (let i = 0; i < data.orders.length; i++) {
        for (let j = 0; j < input.orders.length; j++) {
            if (data.orders[i] == input.orders[j]) {
                isNewOrder = false;
                break;
            }
            else {
                isNewOrder = true;
            }
        }
        if (isNewOrder) {
            let oldLength = input.length;
            let newOrders = [];
            input.orders = data.orders;
            let index = 0;
            for (let i = oldLength; i < data.length; i++) {
                newOrders[index++] = data.orders[i];
            }
            return newOrders;
        }
    }
}

export function printDroneLocation(drones = [], delayPerHumanMinute, i) {
    let allDelivered = false;
    for (const drone of drones) {
        if (drone.order.status != 1) {
            allDelivered = false;
            break;
        }
         allDelivered = true;
    }
    if (allDelivered) {
        return;
    }
    setTimeout(function () {
        console.log(`Drone locations at minute ${i + 1}:`)
        for (let d = 0; d < drones.length; d++) {
            if (drones[d].order.status == 1 && drones[d].x == drones[d].warehouseCoordinates.x && drones[d].y == drones[d].warehouseCoordinates.y) {
                continue;
            }
            console.log(`\tDrone_${d + 1}: x(${drones[d].x}), y(${drones[d].y})`);
            drones[d].moveBy(1);
        }
        printDroneLocation(drones, delayPerHumanMinute, i + 1)
    }, delayPerHumanMinute);
}

export function checkOrdersStatuses(orders = [], checkFrequency, index) {
    let allDelivered = false;
    for (const order of orders) {
        if (order.status != 1) {
            allDelivered = false;
            break;
        }
         allDelivered = true;
    }
    if (allDelivered) {
        return;
    }
    setTimeout(function () {
        console.log(`Order Statuses Report_${index + 1}`);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i].status == -1) {
                var status = "to be delivered";
            }
            else if (orders[i].status == 0) {
                status = "currently in delivery";
            }
            else if (orders[i].status == 1) {
                status = "complete"
            }
            console.log(`\tOrder ${i + 1} status: ${status}`);
        }
        checkOrdersStatuses(orders, checkFrequency, index + 1)
    }, checkFrequency);
}