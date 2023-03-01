import { Warehouse } from './Warehouse.js';
import { Customer } from './Customer.js';
import { Order } from './Order.js';
import { Drone } from './Drone.js';
import { DroneModel } from './Drone.js';
import { sortDeliveriesByProximity, getDistance } from './SortOrders.js';
import { printDroneLocation, checkFileForInput, checkOrdersStatuses } from './AsyncFunctions.js';
import { WebSocketServer } from 'ws';
//import input from './input1.json' assert {type: "json"}; //Scenario 1 input
//import input from './input2.json' assert {type: "json"}; //Scenario 2 input for c)
//import input from './input3.json' assert {type: "json"}; //Scenario input for d)
//import input from './input4.json' assert {type: "json"}; //Scenario 3
import input from './input5.json' assert {type: "json"}; //Scenario 3 input for j)
//Remember to update pathing when checking solution ;)

const deliveryStatus = input.deliveryStatus;
const output = input.output;
const map = input["map-top-right-coordinate"];
const products = input.products;
const warehouses = initializeObjects(input.warehouses, Warehouse);
const customers = initializeObjects(input.customers, Customer);
const orders = initializeObjects(input.orders, Order);
const typesOfDrones = input.typesOfDrones; //For Scenario 2 only!
const chargingStations = input.chargingStations;

function StartProgram() {
    //We're using an infinite amount if drones for every warehouse.
    //There is a lot of concept logic for this project. In this instance, with the input that is provided and without some specificity for conditions and requirements it is unusable.
    //For example: sendOrders() has checks of where a drone is if a warehouse has none left. Every cycle there is a check to confirm if any drones have returned by the time that the longest order has been sent and completed.
    //Classes also have some concepts of tracking and work. The methods should work mostly however I left them aside since time is pressing and it is not that relevant to the solutions you're describing in the task descriptions.
    
    const wss =
        new WebSocketServer({ port: 8080 });
    wss.on('connection', function connection(ws) {
        ws.on('error', console.error);

        ws.on('message', function message(data) {
            console.log('received: %s', data);


            checkFileForInput(input, Math.round(output.minutes.real / output.minutes.program))
                .then((result) => {
                    let newOrders = initializeObjects(result, Order);
                    let newDeliveryPlan = sortDeliveriesByProximity(warehouses, newOrders, customers, map);
                    sendOrders(newDeliveryPlan, products);
                });
        });
        ws.send('Your order has been received!');
    });



    if (deliveryStatus.output) {
        checkOrdersStatuses(orders, deliveryStatus.frequency, 0);
    }

    let deliveryPlan = sortDeliveriesByProximity(warehouses, orders, customers, map);
    sendOrders(deliveryPlan, products);
}

StartProgram();

//Starting with logic methods
function sendOrders(deliveryPlan = [], prodcuts = []) {
    let overallDeliveryTime = 0;
    let overallDeliveryTime2 = 0;
    let dronesUsed = 0;
    let droneModels = initializeObjects(typesOfDrones, DroneModel);
    let deployedDrones = [];
    for (const shipment of deliveryPlan) {
        shipment.order.setWeight(prodcuts);
        overallDeliveryTime2 += shipment.distance;
        let passingTime = 0;
        let warehouse = warehouses.filter(x => { return x.name == shipment.warehouse.name })[0];
        //if (overallDeliveryTime > 0){
        //    checkIfDronesReturned(drones, overallDeliveDryTime); //Was developed on day one. Ultimately the task becomes easier with the drone tracking methods in the Drone class but the methods hasn't been updated.
        //}
        if (warehouse.getAvailableDrones() > 0) {
            if (passingTime < shipment.distance) {
                passingTime = shipment.distance;
            }

            for (let i = 0; i < typesOfDrones.length; i++) {
                if (droneModels[i].hasEnoughCharge(shipment.distance, shipment.order.weight)) {
                    warehouse.dispatchDrone();
                    let newDrone = new Drone(typesOfDrones[i], dronesUsed + 1, chargingStations);
                    newDrone.equipNextOrder(shipment.order);
                    newDrone.setLocation(warehouse.x, warehouse.y);
                    newDrone.setDestination(shipment.location.x, shipment.location.y, true);
                    newDrone.consumeBattery(shipment.distance, shipment.order.weight);
                    deployedDrones.push(newDrone);
                    shipment.order.status = 0;
                    dronesUsed++;
                    break;
                }
                else {
                    droneModels[i].replaceBattery();
                    overallDeliveryTime2 += 20;
                }
            }
        }
        else {
            let closestDrone = findClosestDrone(typesOfDrones, warehouse); //concept method to find the closest drone to the warehouse.
            let distance = getDistance(warehouse, closestDrone);
            if (closestDrone.hasEnoughCharge(distance)) {
                warehouse.droneReturned();
                passingTime += distance + 5;
                warehouse.dispatchDrone();
            }
        }
        if (passingTime > overallDeliveryTime) {
            overallDeliveryTime = passingTime;
        }
    }

    let delayPerAppMinute = Math.round(output.minutes.real / output.minutes.program);
    //Reminder! We are deploying all the drones at the same time
    if (output.poweredOn) {
        printDroneLocation(deployedDrones, delayPerAppMinute, 0);
    }
    printResults(overallDeliveryTime, overallDeliveryTime2, dronesUsed, delayPerAppMinute);
}

function printResults(overallDeliveryTime, overallDeliveryTime2, dronesUsed) {
    console.log(`Time for deliveries to become complete: ${overallDeliveryTime} minutes`); //if drones are sent at once. The slowest delivery is the longest
    console.log(`Overall time to complete all deliveries between drones: ${overallDeliveryTime2} minutes`); //Sum of time needed to delivery all the orders
    console.log(`Drones used: ${dronesUsed}`);
    console.log(`Average Delivery time: ${Math.floor(overallDeliveryTime2 / dronesUsed)} minutes`);
}

function initializeObjects(objectsInformation = [], objectType) {
    let objects = []
    for (let i = 0; i < objectsInformation.length; i++) {
        objects.push(new objectType(objectsInformation[i]));
    }
    return objects;
}

//---------------------Concept methods---------------------------------------------------------------
//Code and solutions might be old. Wouldn't advise going to deep in to their logic since they haven't been updated since day 1
function findClosestDrone(drones = [], warehouse) {
    let nearestLocation = Number.MAX_VALUE;
    for (const drone of drones) {
        let distance = getDistance(warehouse, drone);
        if (distance < nearestLocation) {
            nearestLocation = distance;
            var closestDrone = drone
        }
    }
    return closestDrone;
}

function checkIfDronesReturned(drones = [], timePassed) {
    for (const drone of drones) {
        if (drone.travelTime <= timePassed) {
            warehouse
        }
    }
}