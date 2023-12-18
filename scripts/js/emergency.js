export default class Emergency {
    // Variables
    name;
    code;
    description;
    a;
    b;
    c;
    d;
    e;
    measurementValues;
    auswirkungenMedikamente;
    isDead = false;
    vomitCounter = 0;
    painCounter = 0;
    vomitTimer = null;
    delayedVomitTimer = null;
    vomitDecreaseValue = 0;
    addedVomitAmount = 0;
    delayedVomitSeconds = 20;
    decreasingVomitCounterSeconds = 5;
    delayedPainTimer = null;
    painTimer = null;
    painkiller = {
        "heavy": 75,
        "middle": 50,
        "soft": 25,
    }
    changingPainValue = 0;
    painIsIncreasing = false;
    initHealth;

    /**
     * # Constructor
     * Initializing all values
     * 
     * @param {JSON} jsonObject 
     */
    constructor(jsonObject) {
        this.name = jsonObject.Name;
        this.code = jsonObject.Code;
        this.description = jsonObject.Beschreibung;
        if (jsonObject.isDead) this.isDead = jsonObject.isDead;
        this.a = jsonObject.A;
        this.b = jsonObject.B;
        this.c = jsonObject.C;
        this.d = jsonObject.D;
        this.e = jsonObject.E;
        this.measurementValues = jsonObject.E.Exposure.actions["7-Zwerge"];
        this.auswirkungenMedikamente = jsonObject.auswirkungenMedikamente;
        this.vomitCounter = jsonObject.vomitCounter;
        this.painCounter = jsonObject.painCounter;
        this.initHealth = jsonObject.initHealth;
        if (this.isDead) this.vomitDecreaseValue = 0
        else this.vomitDecreaseValue = 1;
        this.setupPhone();
    }

    /**
     * # setupPhone()
     * Sets the information of the phone to the HTML Elements
     */
    setupPhone() {
        document.querySelector("#code").innerHTML = this.code;
        document.querySelector("#description").innerHTML = this.description;
    }

    /**
     * # setupEmergencyInformation()
     * Sets the information of the emergency information section to the HTML Elements
     */
    setupEmergencyInformation() {
        document.querySelector("#emergency-information-code").innerHTML = this.code;
        document.querySelector("#emergency-information-description").innerHTML = this.description;
        document.querySelector("#emergency-information").style.display = "flex";
    }

    /**
     * # changeMeasurementMedication
     * @param {object} measurement - An object containing the name, current value, and other properties of the measurement to be changed.
     * @param {number} probabilityToIncrease - The probability (out of 100) that the measurement value will be increased by the medication.
     * @param {number} changeTimesFactor - The number of times the measurement value should be changed by the medication.
     * @param {number} changeEveryXSeconds - The time interval (in seconds) between each change in the measurement value.
     */
    changeMeasurementMedication(measurement, probabilityToIncrease, changeTimesFactor, changeEveryXSeconds) {
        // Check if the patient is dead. If so, do not make any changes to the measurement.
        if (!this.isDead) {
            // Determine if the measurement will increase or decrease
            measurement.isIncreasing = (Math.floor(Math.random() * 100) + 1) < probabilityToIncrease;
            // Set the remaining change times
            measurement.remainingChangeTimes = changeTimesFactor;
            // Calculate the value of the measurement after medication
            if (measurement.isIncreasing) {
                measurement.valueAfterMedication = this.measurementValues[measurement.name] + (this.remainingChangeTimes * measurement.changeBy);
            } else {
                measurement.valueAfterMedication = this.measurementValues[measurement.name] - (this.remainingChangeTimes * measurement.changeBy);
            }
            // Set an interval for changing the measurement value
            measurement.medicationTimer = setInterval(() => {
                if (measurement.remainingChangeTimes <= 0) {
                    // Clear the interval if there are no more changes remaining
                    clearInterval(measurement.medicationTimer);
                    measurement.medicationTimer = null;
                } else {
                    // Reduce the remaining change times
                    measurement.remainingChangeTimes--;
                    if (measurement.name === "Blutdruck") {
                        // If the measurement is Blutdruck, split the value into systole and diastole
                        let blutdruckString = this.measurementValues[measurement.name];
                        let values = blutdruckString.split("/");
                        let systole = +values[0];
                        let diastole = +values[1];
                        if (measurement.isIncreasing) {
                            // Increase the systole and diastole values if the measurement is increasing
                            systole += measurement.changeBy.systole;
                            diastole += measurement.changeBy.diastole;
                        } else {
                            // Decrease the systole and diastole values if the measurement is decreasing
                            systole -= measurement.changeBy.systole;
                            diastole -= measurement.changeBy.diastole;
                        }
                        // Rebuild the Blutdruck string with the new systole and diastole values
                        blutdruckString = systole + " / " + diastole;
                        // Update the measurement value in the measurementValues object
                        this.measurementValues[measurement.name] = blutdruckString;
                    } else if (measurement.name === "Sauerstoffsättigung") {
                        if (measurement.isIncreasing) {
                            // If the measurement is Sauerstoffsättigung and it is increasing, check if the value exceeds the maximum
                            if (this.measurementValues["Sauerstoffsättigung"] > measurement.max) {
                                // If it exceeds the maximum, set the value to the maximum and clear the interval
                                this.measurementValues["Sauerstoffsättigung"] = measurement.max
                                clearInterval(measurement.medicationTimer);
                                measurement.medicationTimer = null;
                            } else {
                                // Increase the value of the measurement
                                this.measurementValues["Sauerstoffsättigung"] += measurement.changeBy;
                            }
                        } else {
                            // Decrease the value of the measurement
                            this.measurementValues["Sauerstoffsättigung"] -= measurement.changeBy;
                        }
                    } else if (measurement.name !== "EKG") {
                        // If the measurement is anything else but not EKG, then increase the value when it is increasing and decrease the value when it is decreasing
                        measurement.isIncreasing ? this.measurementValues[measurement.name] += measurement.changeBy : this.measurementValues[measurement.name] -= measurement.changeBy;
                        (this.measurementValues[measurement.name] < 0) ? this.measurementValues[measurement.name] = 0 : null;
                    }
                }
            }, changeEveryXSeconds * 1000);
        }
    }

    /**
     * # changeEKG
     * Changes the EKG measurement to be normal or unnormal based on a probability
     * @param {Measurement} measurement - the measurement object that will be changed
     * @param {number} probabilityToBeNormal - the probability to become normal (0 to 100)
     * @param {number} delayInSeconds - the delay until the measurement changes in seconds
     */
    changeEKG(measurement, probabilityToBeNormal, delayInSeconds) {
        if (!this.isDead) {
            // Generate a random number between 1 and 100 and check if it is less than the probabilityToBeNormal
            let normal = Math.floor(Math.random() * 100) + 1 < probabilityToBeNormal;
            // For the skipping, save it into a temporary value
            if (normal) {
                // Set the measurement value to the normal EKG value
                measurement.valueAfterMedication = measurement.ekg.normal;
            } else {
                // Set the measurement value to the unnormal EKG value
                measurement.valueAfterMedication = measurement.ekg.unnormal;
            }
            // Create a timer that will execute the following code after the delayInSeconds has passed
            measurement.medicationTimer = setInterval(() => {
                if (normal) {
                    // Set the EKG measurement value to the normal value
                    this.measurementValues["EKG"] = measurement.ekg.normal;
                } else {
                    // Set the EKG measurement value to the unnormal value
                    this.measurementValues["EKG"] = measurement.ekg.unnormal;
                }
                // If the measurement value is not "--", set the measurement
                if (measurement.value !== "--") {
                    measurement.setMeasurement(this.measurementValues["EKG"]);
                }
                // Clear the timer
                clearInterval(measurement.medicationTimer);
                measurement.medicationTimer = null;
            }, delayInSeconds * 1000);
        }
    }

    /**
     * # changeMeasurementOxygen()
     * Function to change the oxygen measurement value of a patient
     * @param {Object} measurement - The measurement object to be updated
     * @param {boolean} increase - Determines whether to increase or decrease the oxygen measurement value
     */
    changeMeasurementOxygen(measurement, increase) {
        // Check if the patient is still alive
        if (!this.isDead) {
            // Calculate the factor by which the measurement will be changed
            let changeTimesFactor = measurement.max - measurement.minimumValue;
            let prevChangeTimesFactor = changeTimesFactor;
            clearInterval(measurement.oxygenTimer);
            // Set a timer to repeatedly change the measurement value
            measurement.oxygenTimer = setInterval(() => {
                // If the factor changed, update the value
                if (prevChangeTimesFactor !== (measurement.max - measurement.minimumValue)) {
                    changeTimesFactor = measurement.max - measurement.minimumValue;
                    prevChangeTimesFactor = changeTimesFactor;
                } else {
                    changeTimesFactor--;
                }

                // Increase or decrease the measurement value based on the 'increase' parameter
                if (increase) {
                    if (this.measurementValues["Sauerstoffsättigung"] < measurement.max && changeTimesFactor >= 0) {
                        this.measurementValues["Sauerstoffsättigung"] += measurement.changeBy;
                    } else {
                        clearInterval(measurement.oxygenTimer);
                    }
                } else {
                    if (this.measurementValues["Sauerstoffsättigung"] > measurement.minimumValue && changeTimesFactor >= 0) {
                        this.measurementValues["Sauerstoffsättigung"] -= measurement.changeBy;
                    } else {
                        clearInterval(measurement.oxygenTimer);
                    }
                }
            }, measurement.changeEveryXSeconds * 1000)
        }
    }

    /**
     * # addToVomitCounter()
     ** Increases the vomit counter by a given value and updates the UI accordingly.
     ** If the vomit counter exceeds 100, it is set to 100. A popup is shown if the vomit counter is greater than zero.
     ** The vomit counter decreases by a certain value every decreasingVomitCounterSeconds seconds.
     * @param {Number} value - The value to increase the vomit counter by.
     */
    addToVomitCounter(value) {
        // Increase the vomit counter by the given value and set it to 100 if it exceeds 100.
        this.vomitCounter += value;
        if (this.vomitCounter > 100) this.vomitCounter = 100;

        // Update the vomit counter value in the UI.
        document.querySelector("#vomit-counter-value").innerHTML = Math.floor(this.vomitCounter);

        // Show a vomit popup if the vomit counter is greater than 0.
        if (this.vomitCounter > 0) $("#popup-vomit").modal('show');

        // Decrease the vomit counter by vomitDecreaseValue every decreasingVomitCounterSeconds seconds.
        clearInterval(this.vomitTimer);
        this.vomitTimer = setInterval(() => {
            this.vomitCounter -= this.vomitDecreaseValue;
            if (this.vomitCounter < 0) {
                // If the vomit counter is less than 0, set it to 0 and clear the interval.
                this.vomitCounter = 0;
                clearInterval(this.vomitTimer);
                this.vomitTimer = null;
                this.vomitDecreaseValue = 1;
            }
            // Update the vomit counter value in the UI.
            document.querySelector("#vomit-counter-value").innerHTML = Math.floor(this.vomitCounter);
        }, this.decreasingVomitCounterSeconds * 1000);
    }

    /**
     * # vomit()
     * Causes the patient to vomit with a certain probability, adding a certain amount to the vomit counter if vomit occurs.
     * @param {number} probabilityToVomit - The probability (as a percentage) that the patient will vomit.
     */
    vomit(probabilityToVomit) {
        // Calculate if the patient will vomit
        let vomit = Math.floor(Math.random() * 100) + 1 < probabilityToVomit;

        // Generate the amount of vomit to add if vomiting occurs
        this.addedVomitAmount = Math.floor(Math.random() * 100) + 1;

        if (vomit) {
            // If the patient vomits, set a timer to add the vomit amount to the vomit counter after a delay
            this.delayedVomitTimer = setInterval(() => {
                this.addToVomitCounter(this.addedVomitAmount);
                clearInterval(this.delayedVomitTimer);
                this.delayedVomitTimer = null;
            }, this.delayedVomitSeconds * 1000);
        }
    }

    /**
     * # decreasePain()
     * This function decreases the pain level by a given amount of points at a certain probability. It also changes the painkiller value every X seconds.
     * @param {number} probabilityToDecrease - The probability of decreasing the pain level in percentage.
     * @param {number} painkillerValue - The amount of painkiller value to decrease the pain level.
     * @param {number} changeEveryXSeconds - The time interval in seconds to change the painkiller value.
     * @param {number} delaySeconds - The time interval in seconds to delay the pain decrease.
     */
    decreasePain(probabilityToDecrease, painkillerValue, changeEveryXSeconds, delaySeconds) {
        // Determine whether to decrease the pain level or not
        let decrease = Math.floor(Math.random() * 100) + 1 < probabilityToDecrease;
        if (decrease) this.painIsIncreasing = false;

        // Set the painkiller value and clear any existing delayed pain timer
        this.changingPainValue = painkillerValue;
        clearInterval(this.delayedPainTimer);

        // Delay the pain decrease and change the painkiller value at a given interval
        this.delayedPainTimer = setInterval(() => {
            if (decrease) {
                clearInterval(this.painTimer);
                this.painTimer = setInterval(() => {
                    if (this.painCounter < 0) this.painCounter = 0;
                    document.querySelector("#pain-counter-value").innerHTML = Math.floor(this.painCounter);
                    // Stop the pain timer if the pain level reaches 0 or the painkiller value is used up
                    if (this.painCounter <= 0 || painkillerValue <= 0) {
                        clearInterval(this.painTimer);
                        this.painTimer = null;
                    } else {
                        // Decrease the pain level and the painkiller value
                        this.painCounter--;
                        painkillerValue--;
                        this.changingPainValue = painkillerValue;
                    }
                }, changeEveryXSeconds * 1000);
            }
            // Clear the delayed pain timer
            clearInterval(this.delayedPainTimer);
            this.delayedPainTimer = null;
        }, delaySeconds * 1000);
    }

    /**
     * # increasePain()
     * This function increases the pain level by a given amount of points at a certain probability.
     * @param {number} probabilityToIncrease - The probability of increasing the pain level in percentage.
     * @param {number} valueToIncrease - The amount of pain to increase the pain level.
     * @param {number} changeEveryXSeconds - The time interval in seconds to change the painkiller value.
     * @param {number} delaySeconds - The time interval in seconds to delay the pain decrease.
     */
    increasePain(probabilityToIncrease, valueToIncrease, changeEveryXSeconds, delaySeconds) {
        // Determine whether to increase the pain level or not
        let increase = Math.floor(Math.random() * 100) + 1 < probabilityToIncrease;
        if (increase) this.painIsIncreasing = true;

        // Set the value value and clear any existing delayed pain timer
        this.changingPainValue = valueToIncrease;
        clearInterval(this.delayedPainTimer);

        // Delay the pain increase and change the painkiller value at a given interval
        this.delayedPainTimer = setInterval(() => {
            if (increase) {
                clearInterval(this.painTimer);
                this.painTimer = setInterval(() => {
                    if (this.painCounter > 100) this.painCounter = 100;
                    document.querySelector("#pain-counter-value").innerHTML = Math.floor(this.painCounter);
                    // Stop the pain timer if the pain level reaches 100 or the increasing-value is used up
                    if (this.painCounter >= 100 || valueToIncrease <= 0) {
                        clearInterval(this.painTimer);
                        this.painTimer = null;
                    } else {
                        // Increase the pain level and the increasing-value
                        this.painCounter++;
                        valueToIncrease--;
                        this.changingPainValue = valueToIncrease;
                    }
                }, changeEveryXSeconds * 1000);
            }
            // Clear the delayed pain timer
            clearInterval(this.delayedPainTimer);
            this.delayedPainTimer = null;
        }, delaySeconds * 1000);
    }

    /**
     * # skipPain()
     * This function skips the pain by adding or subtracting the changing pain value
     * depending on whether the pain was increasing or decreasing
     */
    skipPain() {
        // Check if pain was increasing
        if (this.painIsIncreasing) {
            // Add the changing pain value to the pain counter
            this.painCounter += this.changingPainValue;
            // Ensure that the pain counter does not exceed 100
            if (this.painCounter > 100) this.painCounter = 100;
        } else { 
            // If pain was decreasing
            // Subtract the changing pain value from the pain counter
            this.painCounter -= this.changingPainValue;
            // Ensure that the pain counter does not go below 0
            if (this.painCounter < 0) this.painCounter = 0;
        }
        // Update the pain counter display
        document.querySelector("#pain-counter-value").innerHTML = Math.floor(this.painCounter);
    }
}
