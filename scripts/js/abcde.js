export default class Abcde {
    // Variables
    currentEmergency;
    imageSrc;
    #updateMeasurements = new Set();
    allowedMeasurements = new Set();
    measurements = [];
    pendingMeasurements = new Set();
    abcde;

    /**
     * # Constructer
     * Initializing all values and adds the event listeners
     * @param {Object} currentEmergency The current emergency
     * @param {String} imageSrc The image of the patient
     * @param {Array} measurements The measurements array of all measurements
     */
    constructor(currentEmergency, imageSrc, measurements, allowedMeasurements) {
        this.currentEmergency = currentEmergency;
        this.imageSrc = imageSrc;
        this.measurements = measurements;
        this.allowedMeasurements = allowedMeasurements;
        this.abcde = this;

        document.querySelector("#airway").addEventListener("click", () => this.onAirwayClicked());
        document.querySelector("#breathing").addEventListener("click", () => this.onBreathingClicked());
        document.querySelector("#circulation").addEventListener("click", () => this.onCirculationClicked());
        document.querySelector("#disability").addEventListener("click", () => this.onDisabilityClicked());
        document.querySelector("#exposure").addEventListener("click", () => this.onExposureClicked());

        document.querySelector("#vomit-counter").style.display = "flex";
        document.querySelector("#pain-counter").style.display = "flex";

        // Absaugen, changing the vomitDecreaseValue to 6
        document.querySelector("#popup-vomit-btn1").onclick = () => {
            this.currentEmergency.isDead ? this.currentEmergency.vomitDecreaseValue = 0 : this.currentEmergency.vomitDecreaseValue = 6;
            $("#popup-vomit").modal('hide');
        }

        // Kopf drehen, changing the vomitDecreaseValue to 3
        document.querySelector("#popup-vomit-btn2").onclick = () => {
            this.currentEmergency.isDead ? this.currentEmergency.vomitDecreaseValue = 0 : this.currentEmergency.vomitDecreaseValue = 3;
            $("#popup-vomit").modal('hide');
        }

        // function when vomit counter is clicked and the value is greater than 0, then show the popup-vomit
        document.querySelector("#vomit-counter").addEventListener("click", () => {
            if (this.currentEmergency.vomitCounter > 0) {
                $("#popup-vomit").modal('show');
            }
        });

        // Initializing pain and vomit counter
        currentEmergency.increasePain(100, 0, 0, 0);
        currentEmergency.addToVomitCounter(0);

    }

    /**
     * # setupModal
     * Sets the header, description and image for the modal.
     * It also sets additional actions if needed
     * 
     * @param {JSON} json JSON Object of the button which was clicked
     */
    setupABCDEModal(json) {
        let name = Object.keys(json)[0];
        document.querySelector("#popup-header").innerHTML = name;
        document.querySelector("#popup-image").src = this.imageSrc;
        document.querySelector("#popup-hover-btns").style.display = "none";
        document.querySelector("#popup-btn3").style.display = "none";
        document.querySelector("#popup-description-header").innerHTML = json[name].header;
        document.querySelector("#popup-description-text").innerHTML = json[name].description;
        if (json[name].hasOwnProperty("actions")) {
            document.querySelector("#popup-btn1").innerHTML = Object.keys(json[name].actions)[0];
            document.querySelector("#popup-btn1").style.display = "inline";
            document.querySelector("#popup-btn2").innerHTML = Object.keys(json[name].actions)[1];
            document.querySelector("#popup-btn2").style.display = "inline";

            document.querySelector("#popup-btn1").onclick = () => this.onPopupBtnClicked(json, Object.keys(json[name].actions)[0]);
            document.querySelector("#popup-btn2").onclick = () => this.onPopupBtnClicked(json, Object.keys(json[name].actions)[1]);
        } else {
            document.querySelector("#popup-btn1").style.display = "none";
            document.querySelector("#popup-btn2").style.display = "none";
        }
        $("#popup").modal('show');
    }

    /**
     * # onAirwayClicked()
     * When Airway-Button is clicked, setup the modal for the A-Part
     */
    onAirwayClicked() {
        this.setupABCDEModal(this.currentEmergency.a);
    }

    /**
     * # onBreathingClicked()
     * When Breathing-Button is clicked, setup the modal for the B-Part
     */
    onBreathingClicked() {
        this.setupABCDEModal(this.currentEmergency.b);
    }

    /**
     * # onCirculationClicked()
     * When Circulation-Button is clicked, setup the modal for the C-Part
     */
    onCirculationClicked() {
        this.setupABCDEModal(this.currentEmergency.c);
    }

    /**
     * # onDisabilityClicked()
     * When Disability-Button is clicked, setup the modal for the D-Part
     */
    onDisabilityClicked() {
        this.setupABCDEModal(this.currentEmergency.d);
    }

    /**
     * # onExposureClicked()
     * When Exposure-Button is clicked, setup the modal for the E-Part
     */
    onExposureClicked() {
        this.setupABCDEModal(this.currentEmergency.e);
    }

    /**
     * # addMeasurement()
     ** Adds a measurement to the pending list.
     ** If the measurement is allowed, it adds it to the pending list and starts a timer to indicate the measurement is loading.
     ** If there are other pending measurements, they are also indicated as loading.
     ** Once the timer reaches the duration of the current measurement, it adds the measurement to the measurements to be updated,
     * clears the timer, removes the measurement from the pending list, and starts the next pending measurement.
     * @param {Measurement} measurement - The measurement to be added to the pending list.
     */
    addMeasurement(measurement) {
        if (this.allowedMeasurements.has(measurement)) {
            this.pendingMeasurements.add(measurement);
            let pendingMeasurementArray = Array.from(this.pendingMeasurements);
            let currentMeasurment = pendingMeasurementArray[0];
            // Indicate other pending measurements as loading
            for (let i = 1; i < pendingMeasurementArray.length; i++) pendingMeasurementArray[i].indicateLoadingState(0, true);
            let currentSeconds = 0;
            let interval = 200;
            if (!currentMeasurment.addMeasurementTimer) {
                // To enable measuring values again, delete them if they already exist and add them to the list again
                if (this.#updateMeasurements.has(currentMeasurment)) this.#updateMeasurements.delete(currentMeasurment);
                currentMeasurment.addMeasurementTimer = setInterval(() => {
                    currentSeconds += interval;
                    currentMeasurment.indicateLoadingState(currentSeconds, false);
                    if (currentSeconds >= currentMeasurment.duration * 1000) {
                        // Add measurement to the measurements to be updated, clear the timer, and remove the measurement from the pending list
                        this.#updateMeasurements.add(measurement);
                        clearInterval(currentMeasurment.addMeasurementTimer);
                        currentMeasurment.addMeasurementTimer = null;
                        currentMeasurment.duration = currentMeasurment.secondDuration;
                        this.pendingMeasurements.delete(currentMeasurment);
                        // Start next pending measurement
                        pendingMeasurementArray = Array.from(this.pendingMeasurements);
                        this.addMeasurement(pendingMeasurementArray[0]);
                    }
                }, interval);
            }
        }
    }

    /**
     * # getMeasurements()
     * @returns The updateMeasurements Set
     */
    getMeasurements() {
        return this.#updateMeasurements;
    }

    /**
     * # deleteMeasurementFromUpdateMeasurement()
     * Deletes the measurement from the updateMeasurements set
     * @param {Object} measurement Measurement to be deleted
     */
    deleteMeasurementFromUpdateMeasurement(measurement) {
        this.#updateMeasurements.delete(measurement);
    }


    /**
     * # onPopupBtnClicked()
     ** This function handles the click event of a popup button.
     ** It sets the header, description, and text of the modal and
     * loops through every element in case of the "7-Zwerge" action value.
     * @param {Object} btn - The button object that was clicked
     * @param {string} actionValue - The action value associated with the button
     */
    onPopupBtnClicked(btn, actionValue) {
        // Get the name of the button from the first key of the object
        let name = Object.keys(btn)[0];
        // Set the initial header and text for the modal
        const initHeader = "Beginne mit den Abfragen";
        const initText = "Bewege die Maus über die Buttons um die Ergebnisse zu sehen.";

        // Disable the popup buttons
        document.querySelector("#popup-btn1").style.display = "none";
        document.querySelector("#popup-btn2").style.display = "none";

        // Set the header, description, and text of the modal
        document.querySelector("#popup-header").innerHTML = actionValue;
        document.querySelector("#popup-description-header").innerHTML = " ";
        document.querySelector("#popup-description-text").innerHTML = " ";
        document.querySelector("#popup-hover-btns").style.display = "flex";
        document.querySelector("#popup-hover-btns").innerHTML = "";
        document.querySelector("#popup-description-text").innerHTML = initText;
        document.querySelector("#popup-description-header").innerHTML = initHeader;

        // Loop through every element
        if (actionValue === "7-Zwerge") {
            let textTmp = initText;
            let headerTmp = initHeader;
            // Loop through the measurements array
            this.measurements.forEach((measurement) => {
                let button = document.createElement("button");
                button.className = "ui fluid secondary inverted button";
                // Add "disabled" class to the button if the measurement is not allowed
                (this.allowedMeasurements.has(measurement)) ? null : button.classList.add("disabled");
                button.innerHTML = measurement.name;
                button.onmouseover = () => {
                    // Set the description and header of the modal on mouseover
                    document.querySelector("#popup-description-text").innerHTML = "Diese Messung dauert etwa <strong>" + measurement.duration + "</strong> Sekunden.";
                    document.querySelector("#popup-description-header").innerHTML = measurement.name;
                }
                button.onmouseout = () => {
                    // Reset the description and header of the modal on mouseout
                    document.querySelector("#popup-description-text").innerHTML = textTmp;
                    document.querySelector("#popup-description-header").innerHTML = headerTmp;
                }
                button.onclick = () => {
                    // Set the temporary text and header of the modal and show the third button on click
                    textTmp = document.querySelector("#popup-description-text").innerHTML;
                    headerTmp = document.querySelector("#popup-description-header").innerHTML;
                    document.querySelector("#popup-btn3").style.display = "inline";
                    document.querySelector("#popup-btn3").onclick = () => {
                        // Add the selected measurement and reset the modal
                        this.addMeasurement(measurement);
                        document.querySelector("#popup-btn3").style.display = "none";
                        document.querySelector("#popup-description-text").innerHTML = initText;
                        document.querySelector("#popup-description-header").innerHTML = initHeader;
                    }
                }
                document.querySelector("#popup-hover-btns").appendChild(button);
            });
        } else {
            // Temporary variable to store the initial text of the popup description
            let textTmp = initText;
            // Temporary variable to store the initial header of the popup description
            let headerTmp = initHeader;
            // Loop through the actions associated with the button
            Object.keys(btn[name].actions[actionValue]).forEach((el) => {
                // Loop through the actions associated with the button
                // Create a new button element
                let button = document.createElement("button"); 
                // Add a CSS class to the button
                button.className = "ui secondary inverted button";

                // Set the button text depending on the action type
                (el === "Örtlich") ? button.innerHTML = "O" : button.innerHTML = el[0]; 

                // Add a mouseover event listener to the button
                button.onmouseover = () => { 
                    // Change the button text to the full action name
                    button.innerHTML = el;
                    // Set the popup description text to the corresponding action description
                    document.querySelector("#popup-description-text").innerHTML = btn[name].actions[actionValue][el]; 
                    // Set the popup description header to the corresponding action name
                    document.querySelector("#popup-description-header").innerHTML = el; 
                }

                // Add a mouseout event listener to the button
                button.onmouseout = () => { 
                    // Reset the button text to the abbreviated or localized version
                    (el === "Örtlich") ? button.innerHTML = "O" : button.innerHTML = el[0];
                    // Reset the popup description text to the initial value
                    document.querySelector("#popup-description-text").innerHTML = textTmp;
                    // Reset the popup description header to the initial value
                    document.querySelector("#popup-description-header").innerHTML = headerTmp; 
                }

                // Add an onclick event listener to the button
                button.onclick = () => { 
                    // Change the button text to the full action name
                    button.innerHTML = el; 
                    // Store the current popup description text in the temporary variable
                    textTmp = document.querySelector("#popup-description-text").innerHTML; 
                    // Store the current popup description header in the temporary variable
                    headerTmp = document.querySelector("#popup-description-header").innerHTML; 
                }

                if (el === "Zeitlich" && btn[name].actions[actionValue][el].includes("###")) {
                    // If the action type is "Zeitlich" and the description includes the "###" placeholder
                    // Create a new Date object with the current date and time
                    const currentDate = new Date(); 
                    // Format the date as "DD.MM.YYYY"
                    const currentDateString = currentDate.getDate().toString().padStart(2, '0') + "." + (currentDate.getMonth() + 1).toString().padStart(2, '0') + "." + currentDate.getFullYear(); 
                    // Replace the "###" placeholder with the formatted date in the action description
                    btn[name].actions[actionValue][el] = btn[name].actions[actionValue][el].replace("###", currentDateString); 
                }

                // Append the button to the popup hover buttons container
                document.querySelector("#popup-hover-btns").appendChild(button); 
            });
        }
    }
}