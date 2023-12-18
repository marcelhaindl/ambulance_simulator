export default class OxygenIndicator {
    // Array containing the available values of oxygen level
    values = [0, 6, 9, 15];
    // Array containing the number of seconds to change the oxygen value
    seconds = [10, 15, 10, 6];
    // Default number of seconds to change the oxygen value
    defaultSeconds = 9;
    // Boolean indicating if the Oxygen Indicator is turned on or not
    isTurnedOn = false;
    // Object containing the oxygen measurement data
    oxygenMeasurement;
    // Current index of the oxygen level in the values array
    currentIndex = 0;
    // Current oxygen level
    currentValue = 0;
    // Current emergency object
    currentEmergency;

    /**
     * # Constructor
     * Create an Oxygen Indicator object
     * @param {Object} oxygenMeasurement - Object containing the oxygen measurement data
     * @param {Object} currentEmergency - Current emergency object
    */
    constructor(oxygenMeasurement, currentEmergency) {
        this.oxygenMeasurement = oxygenMeasurement;
        this.currentEmergency = currentEmergency;
    }
    /**
     * # increase()
     * Increases the oxygen level
    */
    increase() {
        // Check if the current index is within the values array range
        if (this.currentIndex < this.values.length - 1) this.currentValue = this.values[++this.currentIndex];
        // Update the oxygen value in the HTML
        document.querySelector("#oxygen-value").innerHTML = this.currentValue;
        // Update the number of seconds to change the oxygen value
        this.oxygenMeasurement.changeEveryXSeconds = this.getCurrentSeconds();
        // Change the measurement oxygen data in the current emergency object
        this.isTurnedOn ? this.currentEmergency.changeMeasurementOxygen(this.oxygenMeasurement, true) : this.currentEmergency.changeMeasurementOxygen(this.oxygenMeasurement, false);
    }
    /**
     * # decrease()
     * Decreases the oxygen level
    */
    decrease() {
        // Check if the current index is within the values array range
        if (this.currentIndex > 0) this.currentValue = this.values[--this.currentIndex];
        // Update the oxygen value in the HTML
        document.querySelector("#oxygen-value").innerHTML = this.currentValue;
        // Update the number of seconds to change the oxygen value
        this.oxygenMeasurement.changeEveryXSeconds = this.getCurrentSeconds();
        // Change the measurement oxygen data in the current emergency object
        (this.isTurnedOn && (this.currentValue > 0)) ? this.currentEmergency.changeMeasurementOxygen(this.oxygenMeasurement, true) : this.currentEmergency.changeMeasurementOxygen(this.oxygenMeasurement, false);
    }
    /**
     * # getCurrentSeconds()
     * Returns the number of seconds to change the oxygen value
     * @returns {Number} - Number of seconds
    */
    getCurrentSeconds() {
        if (this.isTurnedOn) return this.seconds[this.currentIndex];
        else return this.defaultSeconds;
    }
}