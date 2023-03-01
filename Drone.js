import { getDistance } from "./SortOrders.js";

export class DroneModel {
    constructor(input) {
        let consumption = input.consumption.substr(0, input.consumption.length - 1);

        this.capacity = this.setCapacity(input.capacity);;
        this.currentCharge = this.capacity;
        this.consumption = Number(consumption);
        this.isDelivering = false;
    }

    setCapacity(capacity) {
        if (capacity.substr(capacity.length - 2) == "kW") {
            capacity = Number(capacity.substr(0, capacity.length - 2)) * 1000;
        }
        else {
            capacity = Number(capacity.substr(0, capacity.length - 1));
        }

        return capacity;
    }

    hasEnoughCharge(distance, packageWeight) {
        let totalBatteryConsumption = ((distance * this.consumption) * 2) + (packageWeight * this.consumption);
        if (totalBatteryConsumption <= this.currentCharge) {
            this.travelTime = 2 * distance;
            return true;
        }
        return false;
    }

    consumeBattery(distance, packageWeight) { //when the drone has a package
        this.currentCharge -= distance * this.consumption * packageWeight;
    }

    consumeBattery(distance) { //when the drone doesn't have a package
        this.currentCharge -= distance * this.consumption;
    }

    isBatteryLow() {
        let percentCharge = this.currentCharge / this.capacity;
        return percentCharge <= 0.4 ? true : false;
    }

    recharge() {
        this.currentCharge = this.capacity;
        if (this.x != warehouseCoordinates.x || this.y != warehouseCoordinates.y) {
            this.x = this.destinationX;
            this.y = this.destinationY;
        }
    }
}

export class Drone extends DroneModel {
    x;
    y;
    destinationX;
    destinationY;
    warehouseCoordinates = {"x": 0, "y": 0};
    constructor(input, id, chargingStations = []) {
        super(input);
        this.id = id;
        this.moveByX = true;
        this.chargingStations = chargingStations;
        //this.travelTime = 0;
    }

    setLocation(x, y) {
        this.x = x;
        this.y = y;
        this.warehouseCoordinates.x = x;
        this.warehouseCoordinates.y = y;
    }

    setDestination(x, y, isDelivery) {
        this.destinationX = x;
        this.destinationY = y;
        this.isDelivering = isDelivery;
    }

    moveBy(spaces) {
        for (let i = 0; i < spaces; i++) {
            if (this.x == this.destinationX) {
                this.moveByX = false;
            }
            else if (this.y == this.destinationY) {
                this.moveByX = true;
            }
            if (this.x < this.destinationX && this.moveByX) {
                this.x++;
                this.moveByX = false;
            }
            else if (this.x > this.destinationX && this.moveByX) {
                this.x--;
                this.moveByX = false;
            }
            else if (this.y < this.destinationY && !this.moveByX) {
                this.y++;
                this.moveByX = true;
            }
            else if (this.y > this.destinationY && !this.moveByX) {
                this.y--;
                this.moveByX = true;
            }
        }
        this.confirmArrival();
        this.trackDroneBattery();
    }

    confirmArrival() {
        if (this.x == this.warehouseCoordinates.x && this.y == this.warehouseCoordinates.y) {
            console.log("\t\tReturned to warehouse");
            return;
        }
        if (this.x == this.destinationX && this.y == this.destinationY) {
            console.log("\t\tDelivery completed!");
            this.order.status = 1;
            this.setDestination(this.warehouseCoordinates.x, this.warehouseCoordinates.y, false);
            this.consumeBattery(getDistance({"x": this.x, "y": this.y}, {"x": this.destinationX, "y": this.destinationY}));
        }
    }

    trackDroneBattery() {
        if (this.isBatteryLow() && this.isDelivering) {
            let closestChargingStation = this.findClosestStation(chargingStations, drone);
            if (this.x != closestChargingStation.x || this.y != closestChargingStation.y) {
                this.setDestination(closestChargingStation.x, closestChargingStation.y, false);
            }
        }
    }

    findClosestStation(chargingStations = [], drone) {
        let shortestDistance = Number.MAX_VALUE;
        let closestChargingStation = null;
        for (const chargingStation of chargingStations) {
            let distance = getDistance(chargingStation, drone);
            if (shortestDistance > distance) {
                shortestDistance = distance;
                closestChargingStation = chargingStation;
            }
        }
    
        return closestChargingStation;
    }

    replaceBattery() {
        return 20;
    }

    equipNextOrder(order) {
        this.order = order;
        return 5;
    }
}