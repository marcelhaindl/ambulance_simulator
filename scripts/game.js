// Imports
import Abcde from "./js/abcde.js";
import Emergency from "./js/emergency.js";
import Equipment from "./js/equipment.js";
import Measurement from "./js/measurement.js";
import Medication from "./js/medication.js";
import Status from "./js/status.js";
import PatientImage from "./js/patient_image.js";
import * as utils from "./js/utils.js";
import OxygenIndicator from "./js/oxygen_indicator.js";
import HealthBar from "./js/health_bar.js";
import Abstransport from "./js/abstransport.js";

// Variables
let emergencies = [];
let equipment = [];
let medications = [];
let currentEmergency = null;
let usedEquipment = [];
let allowedMeasurements = new Set();
let measurements = [];
let status = new Status();
let abcde = null;
let interval = null;
let giveOxygen = false;
let measurementMap = new Map();
let changeTimesLarge = 20;
let changeTimesMiddle = 15;
let changeTimesSmall = 10;
let oxygenIndicator = null;
let healthValue = 0;

// Fetch the emergencies.json file and create an Emergency object for each entry in the JSON data
fetch('./scripts/json/emergencies.json').then((response) => response.json()).then((json) => {
        for (let i = 0; i < Object.keys(json).length; i++) {
                emergencies.push(new Emergency(json[Object.keys(json)[i]]));
        }
});

// Fetch the equipment.json file and create an Equipment object for each entry in the JSON data
fetch('./scripts/json/equipment.json').then((response) => response.json()).then((json) => {
        for (let i = 0; i < Object.keys(json).length; i++) {
                equipment.push(new Equipment(json[Object.keys(json)[i]]));
        }
});

// Fetch the medications.json file and create a Medication object for each entry in the JSON data
fetch('./scripts/json/medications.json').then((response) => response.json()).then((json) => {
        for (let i = 0; i < Object.keys(json).length; i++) {
                medications.push(new Medication(json[Object.keys(json)[i]]));
        }
});

// Fetch the measurements.json file and create a Measurement object for each entry in the JSON data
fetch("./scripts/json/measurements.json").then((response) => response.json()).then((json) => {
        for (let i = 0; i < Object.keys(json).length; i++) {
                measurements.push(new Measurement(json[Object.keys(json)[i]]));
        }

        // For each Measurement object, add it to the measurementMap using its name as the key
        measurements.forEach((measurement) => {
                measurementMap.set(measurement.name, measurement);
        });
});


// Add event listener to start button
document.querySelector("#start").addEventListener("click", function () {
        // Show phone interface
        utils.showPhone();
        // Update status
        status.setStatus(6);

        // Choose a random emergency from the emergencies array
        let randomEmergency = Math.floor(Math.random() * emergencies.length);
        currentEmergency = emergencies[randomEmergency];

        // Update minimum measurement values for the current emergency
        measurementMap.forEach((measurement) => {
                measurement.minimumValue = currentEmergency.measurementValues[measurement.name];
        })

        // Set up the phone interface with the details of the current emergency
        currentEmergency.setupPhone();
});

// Add event listener to quittieren button
document.querySelector("#quittieren").addEventListener("click", function () {
        // Show the driving screen
        utils.showDriving();

        // Update status
        status.setStatus(2);

        // Iterate through each equipment object and call the addImage() function to display the equipment image
        equipment.forEach((equipment) => {
                equipment.addImage();
        });

        // Call the setupEmergencyInformation() function on the currentEmergency object to display information about the emergency
        currentEmergency.setupEmergencyInformation();
});

document.querySelector("#next").addEventListener("click", function () {

        // Save every used equipment into an array
        equipment.forEach((equipment) => {
                if (equipment.isChecked) {
                        usedEquipment.push(equipment);
                }
        });

        // If at least one equipment is chosen, then continue
        if (usedEquipment.length > 0) {
                utils.showPatient();
                status.setStatus(3);

                // Creates a random patient image
                const patientImage = new PatientImage();

                // Create health bar and abstract transport objects
                let healthBar = new HealthBar(200000, 1.5, currentEmergency.initHealth, currentEmergency, measurementMap);
                let abstransport = new Abstransport(healthBar, status);

                // If Ampullarium was chosen, then show the "Ampullarium öffnen" - Button
                // If Sauerstofftasche was chosen, then show the "Sauerstoff geben" - Button 
                // If Absaugeinheit was chosen, then show the "Absaugen" - Button 
                usedEquipment.forEach((equipment) => {
                        if (equipment.name === "Ampullarium") {
                                document.querySelector("#give-medicine").style.display = "block";
                                document.querySelector("#give-medicine").addEventListener("click", onGiveMedicineClick);
                        }
                        if (equipment.name === "Sauerstofftasche") {
                                document.querySelector("#oxygen").style.display = "flex";
                                document.querySelector("#oxygen-btn").addEventListener("click", onOxygenBtnClick);
                                oxygenIndicator = new OxygenIndicator(measurementMap.get("Sauerstoffsättigung"), currentEmergency);
                                document.querySelector("#oxygen-value").style.color = "grey";
                                document.querySelector("#oxygen-label").style.color = "grey";
                                document.querySelector("#oxygen-minus").addEventListener("click", () => oxygenIndicator.decrease());
                                document.querySelector("#oxygen-plus").addEventListener("click", () => oxygenIndicator.increase());
                        }
                        if (equipment.name === "Absaugeinheit") {
                                document.querySelector("#popup-vomit-btn1").style.display = "inline";
                        }
                });


                // Initialize all Measurements and set allowed measurements considering the equipement
                measurements.forEach((measurement) => {
                        // Create measurement element and add it to the DOM
                        measurement.initMeasurementElement();
                        // Check if the current equipment is needed for this measurement
                        usedEquipment.forEach((equipment) => {
                                if (measurement.equipmentNeeded.includes(equipment.name)) allowedMeasurements.add(measurement);
                                else if (measurement.name === "Atemfrequenz") allowedMeasurements.add(measurement);
                        });
                });

                // Initialize all ABCDE Buttons and add Event Listeners
                abcde = new Abcde(currentEmergency, patientImage.randomImage, measurements, allowedMeasurements);

                // Interval for Monitoring every 3 seconds
                clearInterval(interval);
                interval = setInterval(function () {
                        let measuredMeasurements = 0;
                        // Update all measurements in the allowedMeasurements set
                        abcde.getMeasurements().forEach((measurement) => {
                                if (measurement.value < measurement.minimumValue) measurement.minimumValue = measurement.value;
                                measurement.setMeasurement(currentEmergency.measurementValues[measurement.name]);
                                if (measurement.range <= 0) abcde.deleteMeasurementFromUpdateMeasurement(measurement);
                        });
                        // Count the number of measured measurements
                        abcde.allowedMeasurements.forEach((measurement) => {
                                if (measurement.color !== "grey") measuredMeasurements++;
                        });
                        // Check if the minimum required number of measurements have been made
                        if (abcde.allowedMeasurements.size > 2) {
                                if (measuredMeasurements > 2) abstransport.show();
                        } else {
                                if (measuredMeasurements >= abcde.allowedMeasurements.size) abstransport.show();
                        }

                }, 3000);

        } else {
                // If not one equipment is chosen, then show the error message at the DOM
                document.querySelector("#min-equipment").style.display = "block";
        }
});

/**
 * # onGiveOxygenBtnClick()
 * 
 * This function is called when the "Give Oxygen" button is clicked. 
 */
function onOxygenBtnClick() {
        // Toggle the giveOxygen variable to turn the oxygen supply on or off
        giveOxygen = !giveOxygen;

        // If the oxygen supply is turned on
        if (giveOxygen) {
                // Update the UI by changing the button color and text
                document.querySelector("#oxygen-btn").classList.remove("grey");
                document.querySelector("#oxygen-btn").classList.add("blue");
                document.querySelector("#oxygen-value").style.color = "black";
                document.querySelector("#oxygen-label").style.color = "black";
                document.querySelector("#oxygen-btn").innerHTML = "Sauerstoff AUS";

                // Turn on the oxygenIndicator object and update some properties
                oxygenIndicator.isTurnedOn = true;
                measurementMap.get("Sauerstoffsättigung").changeEveryXSeconds = oxygenIndicator.getCurrentSeconds();

                // If the current oxygen value is greater than 0, call the currentEmergency object's 
                // changeMeasurementOxygen method with the "Sauerstoffsättigung" measurement and a value of true.
                // Otherwise, call it with a value of false.
                oxygenIndicator.currentValue > 0 ?
                        currentEmergency.changeMeasurementOxygen(measurementMap.get("Sauerstoffsättigung"), true) :
                        currentEmergency.changeMeasurementOxygen(measurementMap.get("Sauerstoffsättigung"), false);
        }
        // If the oxygen supply is turned off
        else {
                // Update the UI by changing the button color and text
                document.querySelector("#oxygen-btn").classList.add("grey");
                document.querySelector("#oxygen-btn").classList.remove("blue");
                document.querySelector("#oxygen-value").style.color = "grey";
                document.querySelector("#oxygen-label").style.color = "grey";
                document.querySelector("#oxygen-btn").innerHTML = "Sauerstoff AN";

                // Turn off the oxygenIndicator object and update some properties
                oxygenIndicator.isTurnedOn = false;
                measurementMap.get("Sauerstoffsättigung").changeEveryXSeconds = oxygenIndicator.getCurrentSeconds();

                // Call the currentEmergency object's changeMeasurementOxygen method with the "Sauerstoffsättigung" measurement 
                // and a value of false.
                currentEmergency.changeMeasurementOxygen(measurementMap.get("Sauerstoffsättigung"), false);
        }
}


/**
 * # onGiveMedicineClick()
 * 
 * This function is called when the "Give Medicine" button is clicked. 
 * It displays a list of available medications and their information on a popup.
 */
function onGiveMedicineClick() {
        // Initialize variables for the header and text of the popup.
        const initHeader = "Medikamenteninformation";
        let initTextWirkstoffe = "<li>Für genauere Informationen, wähle ein Medikament.</li>";
        let initTextIndikationen = initTextWirkstoffe;
        let initTextKontraindikationen = initTextIndikationen;
        let initTextAuswirkungen = initTextKontraindikationen;
        let initTextNebenwirkungen = initTextAuswirkungen;

        // Create temporary variables to store the text of the popup.
        let textWirkstoffeTmp = initTextWirkstoffe;
        let textIndikationenTmp = initTextIndikationen;
        let textKontraindikationenTmp = initTextKontraindikationen;
        let textAuswirkungenTmp = initTextAuswirkungen;
        let textNebenwirkungenTmp = initTextNebenwirkungen;

        // Create a temporary variable to store the header of the popup.
        let headerTmp = initHeader;

        // Clear the contents of the popup and display the initial header and text.
        document.querySelector("#popup-medication-hover-btns").innerHTML = "";
        document.querySelector("#popup-medication-description-header").innerHTML = initHeader;
        document.querySelector("#popup-medication-wirkstoffe").innerHTML = initTextWirkstoffe;
        document.querySelector("#popup-medication-auswirkungen").innerHTML = initTextAuswirkungen;
        document.querySelector("#popup-medication-nebenwirkungen").innerHTML = initTextNebenwirkungen;
        document.querySelector("#popup-medication-indikationen").innerHTML = initTextIndikationen;
        document.querySelector("#popup-medication-kontraindikationen").innerHTML = initTextKontraindikationen;
        document.querySelector("#popup-medication-btn").style.display = "none";
        document.querySelector("#popup-medication-skip-btn").style.display = "none";
        document.querySelector("#popup-medication-warning-message").style.display = "none";

        // Loop through each medication and create a button for it.
        medications.forEach((medication) => {
                let button = document.createElement("button");
                button.className = "ui fluid secondary inverted button";
                button.innerHTML = medication.name;

                // When the button is hovered over, display information about the medication.
                button.onmouseover = () => {
                        document.querySelector("#popup-medication-description-header").innerHTML = medication.name;
                        document.querySelector("#popup-medication-wirkstoffe").innerHTML = "";
                        document.querySelector("#popup-medication-auswirkungen").innerHTML = "";
                        document.querySelector("#popup-medication-nebenwirkungen").innerHTML = "";
                        document.querySelector("#popup-medication-indikationen").innerHTML = "";
                        document.querySelector("#popup-medication-kontraindikationen").innerHTML = "";

                        // Loop through each attribute of the medication and display its information.
                        medication.wirkstoffe.forEach((wirkstoff) => {
                                let wirkstoffItem = document.createElement("li");
                                wirkstoffItem.innerHTML = wirkstoff;
                                document.querySelector("#popup-medication-wirkstoffe").appendChild(wirkstoffItem);
                        });
                        medication.auswirkungen.forEach((auswirkung) => {
                                let auswirkungItem = document.createElement("li");
                                auswirkungItem.innerHTML = auswirkung;
                                document.querySelector("#popup-medication-auswirkungen").appendChild(auswirkungItem);
                        });
                        medication.nebenwirkungen.forEach((nebenwirkung) => {
                                let nebenwirkungItem = document.createElement("li");
                                nebenwirkungItem.innerHTML = nebenwirkung;
                                document.querySelector("#popup-medication-nebenwirkungen").appendChild(nebenwirkungItem);
                        });
                        medication.indikationen.forEach((indikation) => {
                                let indikationItem = document.createElement("li");
                                indikationItem.innerHTML = indikation;
                                document.querySelector("#popup-medication-indikationen").appendChild(indikationItem);
                        });
                        medication.kontraindikationen.forEach((kontraindikation) => {
                                let kontraindikationItem = document.createElement("li");
                                kontraindikationItem.innerHTML = kontraindikation;
                                document.querySelector("#popup-medication-kontraindikationen").appendChild(kontraindikationItem);
                        });
                }
                button.onmouseout = () => {
                        // When the mouse leaves the button, reset the medication popup to the original state
                        document.querySelector("#popup-medication-description-header").innerHTML = headerTmp;
                        document.querySelector("#popup-medication-wirkstoffe").innerHTML = textWirkstoffeTmp;
                        document.querySelector("#popup-medication-auswirkungen").innerHTML = textAuswirkungenTmp;
                        document.querySelector("#popup-medication-nebenwirkungen").innerHTML = textNebenwirkungenTmp;
                        document.querySelector("#popup-medication-indikationen").innerHTML = textIndikationenTmp;
                        document.querySelector("#popup-medication-kontraindikationen").innerHTML = textKontraindikationenTmp;
                }
                button.onclick = () => {
                        // When the button is clicked, display the medication popup
                        // Clear the lists where the medication information will be displayed
                        document.querySelector("#popup-medication-wirkstoffe").innerHTML = "";
                        document.querySelector("#popup-medication-auswirkungen").innerHTML = "";
                        document.querySelector("#popup-medication-nebenwirkungen").innerHTML = "";
                        document.querySelector("#popup-medication-indikationen").innerHTML = "";
                        document.querySelector("#popup-medication-kontraindikationen").innerHTML = "";

                        // For each medication attribute, create a list item and append it to the corresponding list
                        medication.wirkstoffe.forEach((wirkstoff) => {
                                let wirkstoffItem = document.createElement("li");
                                wirkstoffItem.innerHTML = wirkstoff;
                                document.querySelector("#popup-medication-wirkstoffe").appendChild(wirkstoffItem);
                        });
                        medication.auswirkungen.forEach((auswirkung) => {
                                let auswirkungItem = document.createElement("li");
                                auswirkungItem.innerHTML = auswirkung;
                                document.querySelector("#popup-medication-auswirkungen").appendChild(auswirkungItem);
                        });
                        medication.nebenwirkungen.forEach((nebenwirkung) => {
                                let nebenwirkungItem = document.createElement("li");
                                nebenwirkungItem.innerHTML = nebenwirkung;
                                document.querySelector("#popup-medication-nebenwirkungen").appendChild(nebenwirkungItem);
                        });
                        medication.indikationen.forEach((indikation) => {
                                let indikationItem = document.createElement("li");
                                indikationItem.innerHTML = indikation;
                                document.querySelector("#popup-medication-indikationen").appendChild(indikationItem);
                        });
                        medication.kontraindikationen.forEach((kontraindikation) => {
                                let kontraindikationItem = document.createElement("li");
                                kontraindikationItem.innerHTML = kontraindikation;
                                document.querySelector("#popup-medication-kontraindikationen").appendChild(kontraindikationItem);
                        });

                        // Display the "Skip" button
                        document.querySelector("#popup-medication-btn").style.display = "inline";
                        document.querySelector("#popup-medication-btn").onclick = () => {
                                // When the "Skip" button is clicked, remove it and the warning message, and skip the medication
                                document.querySelector("#popup-medication-btn").style.display = "none";

                                let medicationTimerExisting = false;

                                // Check if there is any active medication timer
                                for (let i = 0; i < measurements.length; i++) {
                                        if (measurements[i].medicationTimer) {
                                                medicationTimerExisting = true;
                                        }
                                }

                                if (medicationTimerExisting || currentEmergency.delayedVomitTimer || currentEmergency.delayedPainTimer || currentEmergency.painTimer) {
                                        // Display the medication skip button and warning message
                                        document.querySelector("#popup-medication-skip-btn").style.display = "inline";
                                        document.querySelector("#popup-medication-warning-message").style.display = "inline";
                                        // Set the onclick event for the medication skip button
                                        document.querySelector("#popup-medication-skip-btn").onclick = () => {
                                                // Hide the medication skip button and warning message
                                                document.querySelector("#popup-medication-skip-btn").style.display = "none";
                                                document.querySelector("#popup-medication-skip-btn").style.display = "none";
                                                document.querySelector("#popup-medication-warning-message").style.display = "none";

                                                // If there is a delayed vomit timer, add the added vomit amount to the vomit counter and clear the timer
                                                if (currentEmergency.delayedVomitTimer) {
                                                        currentEmergency.addToVomitCounter(currentEmergency.addedVomitAmount);
                                                        clearInterval(currentEmergency.delayedVomitTimer);
                                                        currentEmergency.delayedVomitTimer = null;
                                                }

                                                // If there is a delayed pain timer or pain timer, skip the pain and clear the timers
                                                if (currentEmergency.delayedPainTimer || currentEmergency.painTimer) {
                                                        currentEmergency.skipPain();
                                                        clearInterval(currentEmergency.delayedPainTimer);
                                                        currentEmergency.delayedPainTimer = null;
                                                        clearInterval(currentEmergency.painTimer);
                                                        currentEmergency.painTimer = null;
                                                }

                                                // If the medication timer exists, update the measurement values and clear the timer
                                                if (medicationTimerExisting) {
                                                        // Loop through each measurement and update the values
                                                        measurements.forEach((measurement) => {
                                                                if (measurement.medicationTimer) {
                                                                        if (measurement.name === "Blutdruck") {
                                                                                // Split the blood pressure values and update them based on whether they are increasing or decreasing
                                                                                let blutdruckString = currentEmergency.measurementValues[measurement.name];
                                                                                let values = blutdruckString.split("/");
                                                                                let systole = +values[0];
                                                                                let diastole = +values[1];
                                                                                if (measurement.isIncreasing) {
                                                                                        systole += measurement.remainingChangeTimes * measurement.changeBy.systole;
                                                                                        diastole += measurement.remainingChangeTimes * measurement.changeBy.diastole;
                                                                                } else {
                                                                                        systole -= measurement.remainingChangeTimes * measurement.changeBy.systole;
                                                                                        diastole -= measurement.remainingChangeTimes * measurement.changeBy.diastole;
                                                                                }
                                                                                blutdruckString = systole + " / " + diastole;
                                                                                currentEmergency.measurementValues[measurement.name] = blutdruckString;
                                                                        } else if (measurement.name === "EKG") {
                                                                                // Update the EKG measurement value and set the measurement if the value is not "--"
                                                                                currentEmergency.measurementValues["EKG"] = measurement.valueAfterMedication;
                                                                                if (measurement.value !== "--") measurement.setMeasurement(currentEmergency.measurementValues["EKG"]);
                                                                        } else if (measurement.name === "Sauerstoffsättigung") {
                                                                                // Update the oxygen saturation value based on whether it is increasing or decreasing
                                                                                measurement.isIncreasing ? currentEmergency.measurementValues[measurement.name] += measurement.remainingChangeTimes * measurement.changeBy : currentEmergency.measurementValues[measurement.name] -= measurement.remainingChangeTimes * measurement.changeBy;
                                                                                // Set the maximum value if it is exceeded
                                                                                if (currentEmergency.measurementValues[measurement.name] > measurement.max) currentEmergency.measurementValues[measurement.name] = measurement.max;
                                                                        } else {
                                                                                // Increase or decrease the measurement value based on whether the medication is increasing or decreasing the value
                                                                                measurement.isIncreasing ? currentEmergency.measurementValues[measurement.name] += measurement.remainingChangeTimes * measurement.changeBy : currentEmergency.measurementValues[measurement.name] -= measurement.remainingChangeTimes * measurement.changeBy;
                                                                        }
                                                                        // Clear the medication timer and set it to null
                                                                        clearInterval(measurement.medicationTimer);
                                                                        measurement.medicationTimer = null;
                                                                }
                                                        });
                                                        // Show the medication button in the popup
                                                        document.querySelector("#popup-medication-btn").style.display = "inline";
                                                }
                                        };
                                } else {
                                        // If no timer exists, then start the medication affects on the patient
                                        currentEmergency.auswirkungenMedikamente[medication.name].forEach((auswirkung) => eval(auswirkung));
                                }
                        }
                        // Retrieve the inner HTML content of various elements in the medication popup and assign them to temporary variables for later use.
                        headerTmp = document.querySelector("#popup-medication-description-header").innerHTML;
                        textWirkstoffeTmp = document.querySelector("#popup-medication-wirkstoffe").innerHTML;
                        textIndikationenTmp = document.querySelector("#popup-medication-indikationen").innerHTML;
                        textKontraindikationenTmp = document.querySelector("#popup-medication-kontraindikationen").innerHTML;
                        textAuswirkungenTmp = document.querySelector("#popup-medication-auswirkungen").innerHTML;
                        textNebenwirkungenTmp = document.querySelector("#popup-medication-nebenwirkungen").innerHTML;
                }
                document.querySelector("#popup-medication-hover-btns").appendChild(button);
        });
        $("#popup-medication").modal('show');
}