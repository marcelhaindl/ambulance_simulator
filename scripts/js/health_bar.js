import * as utils from "./utils.js";

export default class HealthBar {
    // Variables
    total;
    currentHealth;
    healthChanger = 0;
    prevHealthChanger = 0;
    everyXSeconds = 0;
    healthTimer = null;
    measurementMap;
    currentEmergency;

    /**
     * # Constructor
     * Creates an instance of the HealthBar class.
     * @param {number} total - The total health points.
     * @param {number} everyXSeconds - The time interval to update the health points.
     * @param {number} currentHealthPercentage - The current health percentage.
     * @param {object} currentEmergency - The current emergency object.
     * @param {Map} measurementMap - The measurements and their limits.
     */
    constructor(total, everyXSeconds, currentHealthPercentage, currentEmergency, measurementMap) {
        this.total = total;
        this.currentHealth = Math.floor(this.total * (currentHealthPercentage / 100));
        document.querySelector("#health-bar").style.width = currentHealthPercentage + "%";
        this.measurementMap = measurementMap;
        this.currentEmergency = currentEmergency;
        this.everyXSeconds = everyXSeconds;
        this.healthTimer = setInterval(() => {
            
            this.healthChanger += currentEmergency.painCounter;
            this.healthChanger += currentEmergency.vomitCounter;
            measurementMap.forEach((measurement) => {
                if (measurement.color !== "green") {
                    // When the measurement is not green, calculate the change to the health points.
                    if (measurement.name === "Sauerstoffsättigung") {
                        // When it's "Sauerstoffsättigung", calculate based on the limit.
                        if (currentEmergency.measurementValues[measurement.name] < measurement.min) {
                            this.healthChanger += Math.abs(measurement.min - currentEmergency.measurementValues[measurement.name]);
                        }
                    } else if (measurement.name === "Blutdruck") {
                        // If it is the "Blutdruck", then split the value (for example "180 / 100" => systole = 180; diastole = 100)
                        let bloodPressure = currentEmergency.measurementValues[measurement.name].split("/");
                        let systole = parseInt(bloodPressure[0]);
                        let diastole = parseInt(bloodPressure[1]);

                        // Split the value of the max borders
                        let maxBorders = measurement.max.split("/");
                        let maxSystole = parseInt(maxBorders[0]);
                        let maxDiastole = parseInt(maxBorders[1]);

                        // Split the values for the min borders
                        let minBorders = measurement.min.split("/");
                        let minSystole = parseInt(minBorders[0]);
                        let minDiastole = parseInt(minBorders[1]);

                        // Check if systole and diastole are within the acceptable range
                        if (systole > maxSystole) {
                            // If systole is too high, add the difference to healthChanger
                            this.healthChanger += Math.abs(systole - maxSystole);
                        } else if (systole < minSystole) {
                            // If systole is too low, add the difference to healthChanger
                            this.healthChanger += Math.abs(minSystole - systole);
                        }
                        if (diastole > maxDiastole) {
                            // If diastole is too high, add the difference to healthChanger
                            this.healthChanger += Math.abs(diastole - maxDiastole);
                        } else if (diastole < minDiastole) {
                            // If diastole is too low, add the difference to healthChanger
                            this.healthChanger += Math.abs(minDiastole - diastole);
                        }
                    } else if (measurement.name === "EKG") {
                        // If it is "EKG", add 150 to healthChanger
                        this.healthChanger += 150;
                    } else {
                        // For all other measurements, check if the value is within the acceptable range
                        let value = currentEmergency.measurementValues[measurement.name];
                        let max = measurement.max;
                        let min = measurement.min;
                        if (value > max) {
                            // If the value is too high, add the difference to healthChanger
                            this.healthChanger += Math.abs(value - max);
                        } else if (value < min) {
                            // If the value is too low, add the difference to healthChanger, multiplied by 4 for Atemfrequenz or Herzfrequenz
                            if (measurement.name === "Atemfrequenz" || measurement.name === "Herzfrequenz") this.healthChanger += (min - value) * 4;
                            else this.healthChanger += Math.abs(min - value);
                        }
                    }
                } else {
                    if (measurement.name === "Sauerstoffsättigung") {
                        // Reduce the health changer by the difference of the value and the minimum value
                        this.healthChanger -= Math.abs(currentEmergency.measurementValues[measurement.name] - measurement.min);
                    } else if (measurement.name === "Blutdruck") {
                        // If it is the "Blutdruck", then split the value (for example "180 / 100" => systole = 180; diastole = 100)
                        let bloodPressure = currentEmergency.measurementValues[measurement.name].split("/");
                        let systole = parseInt(bloodPressure[0]);
                        let diastole = parseInt(bloodPressure[1]);

                        // Split the value of the max borders
                        let maxBorders = measurement.max.split("/");
                        let maxSystole = parseInt(maxBorders[0]);
                        let maxDiastole = parseInt(maxBorders[1]);

                        // Split the values for the min borders
                        let minBorders = measurement.min.split("/");
                        let minSystole = parseInt(minBorders[0]);
                        let minDiastole = parseInt(minBorders[1]);

                        // Calculate the average sytole and diastole
                        let averageSystole = (maxSystole + minSystole) / 2
                        let averageDiastole = (maxDiastole + minDiastole) / 2

                        // Reduce the health changer by how far the values are away from the average value
                        this.healthChanger -= Math.abs(averageSystole - systole);
                        this.healthChanger -= Math.abs(averageDiastole - diastole);
                    } else if (measurement.name === "EKG") {
                        // Reduce the value by 75 when EKG is green
                        this.healthChanger -= 75;
                    } else {
                        // Get the max and min values
                        let value = currentEmergency.measurementValues[measurement.name];
                        let max = measurement.max;
                        let min = measurement.min;

                        // Calculate the average value
                        let average = (max + min) / 2;

                        // Reduce the health changer by how far the value is away from the average
                        this.healthChanger -= Math.abs(average - value);
                    }
                }
                if (Math.floor(currentEmergency.measurementValues[measurement.name]) <= 0) {
                    // If one measurement is lower or equal to 0, then the patient died
                    this.patientDied();
                }
            });
            // Call the change value function, which updates the health bar
            this.changeValue()
            // Reset the health changer value to 0
            this.healthChanger = 0;
        }, this.everyXSeconds * 1000);

    }

    /**
     * # changeValue()
     ** Updates the patient's current health value based on the accumulated healthChanger value.
     ** Also updates the health bar displayed on the page.
     */
    changeValue() {
        // Store the current health changer value for future reference
        this.prevHealthChanger = this.healthChanger;

        // Subtract the health changer value from the current health value
        this.currentHealth -= this.healthChanger;

        // Make sure the current health value doesn't exceed the maximum health value
        if (this.currentHealth > this.total) {
            this.currentHealth = this.total;
        }

        // If the current health value is below zero, the patient has died
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
            this.patientDied();
        }

        // Update the health bar displayed on the page
        document.querySelector("#health-bar").style.width = (this.currentHealth / this.total) * 100 + "%";
    }

    /**
     * # patientDied()
     * The patientDied function is responsible for stopping all active timers and resetting the current health of the patient to 0, as well as updating the relevant UI elements.
    */
    patientDied() {
        // Stop the healthTimer
        clearInterval(this.healthTimer);
        // Set the current health to 0
        this.currentHealth = 0;

        // Update the health bar
        document.querySelector("#health-bar").style.width = (this.currentHealth / this.total) * 100 + "%";

        // Reset all measurement elements and stop any active medication timers
        this.measurementMap.forEach((measurement) => {
            // Reset the measurement element
            measurement.initMeasurementElement();

            // Stop any active medication timers
            clearInterval(measurement.medicationTimer);

            // Set the medication timer to null
            measurement.medicationTimer = null;
        });

        // Stop the vomitTimer and painTimer for the current emergency
        clearInterval(this.currentEmergency.vomitTimer);
        this.currentEmergency.vomitTimer = null;
        clearInterval(this.currentEmergency.painTimer);
        this.currentEmergency.painTimer = null;

        // Show the "patient died" screen
        utils.showDiedScreen();

        // Reset the painCounter and vomitCounter to "--" and update the UI
        this.currentEmergency.painCounter = "--";
        document.querySelector("#pain-counter-value").innerHTML = this.currentEmergency.painCounter;
        this.currentEmergency.vomitCounter = "--";
        document.querySelector("#vomit-counter-value").innerHTML = this.currentEmergency.vomitCounter;
    }
}