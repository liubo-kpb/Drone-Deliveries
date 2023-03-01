export class Warehouse {
    constructor(input) {
        this.x = input.x;
        this.y = input.y;
        this.name = input.name;
        this.dronesAvailable = 1000; //to mimic infinity drones
        this.drones = [];
    }

    getAvailableDrones() {
        return this.dronesAvailable;
    }

    dispatchDrone(drone) {
        this.dronesAvailable--;
        
        let index = this.drones.indexOf(drone);
        this.drones.splice(index, 1);
    }

    droneReturned(drone) {
        this.dronesAvailable++;
        this.drones.push(drone);
    }
}