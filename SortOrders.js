export function sortDeliveriesByProximity(warehouses = [], orders = [], customers = [], map) {
    let proximityWarehouses = findClosestWarehouse(warehouses, orders, customers, map);
    let deliveryPlanOrder = proximityWarehouses;
    for (let i = 0; i < proximityWarehouses.length - 1; i++) {
        for (let j = i + 1; j < proximityWarehouses.length; j++) {
            if (deliveryPlanOrder[i].distance > proximityWarehouses[j].distance && deliveryPlanOrder[i].warehouse.name == proximityWarehouses[j].warehouse.name) {
                let temp = deliveryPlanOrder[i];
                deliveryPlanOrder[i] = proximityWarehouses[j];
                deliveryPlanOrder[j] = temp;
            }
        }
    }
    return deliveryPlanOrder;
}

function findClosestWarehouse(warehouses = [], orders = [], customers = [], map) {
    let proximityWarehouses = []
    for (const order of orders) {
        if (isPromise(order) && order.isFulfilled) {
            order.then(function(result) {
                order = result;
            });
        }
        else if (isPromise(order) && !order.isFulfilled) {
            continue;
        }
            let smallestDistance = map.x + map.y;
            const customer = customers.filter(x => { return x.id == order.customerId })[0];
            for (let i = 0; i < warehouses.length; i++) {
                let distance = getDistance(warehouses[i], customer);
                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    var optimalWarehouse = { "order": order, "warehouse": warehouses[i], "distance": smallestDistance, "location": { "x": customer.x, "y": customer.y } };
                }
            }
            proximityWarehouses.push(optimalWarehouse);
        }
    return proximityWarehouses;
}

function isPromise(promise) {
    return !!promise && typeof promise.then == 'function'
}

export function getDistance(object1, object2) {
    return (Math.abs(object1.x - object2.x) + Math.abs(object1.y - object2.y))
}