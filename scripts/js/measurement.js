export default class Measurement {
    /**
     * Variables
     */
    name;
    value;
    unit;
    color = "grey";
    range = 0;
    max = 0;
    min = 0;
    duration = 0;
    secondDuration = 0;
    addMeasurementTimer = null;
    oxygenTimer = null;
    changeBy = 0;
    #measurementsElement;
    #measurementInformationElement;
    #measurementValueElement;
    #measurementNameElement;
    #measurementBorderElement;
    loadingStates = ["--", "\\", "|", "/"];
    currentLoadingState = 0;
    equipmentNeeded;

    remainingChangeTimes = 0;
    changeEveryXSeconds = 10;

    isIncreasing = false;

    medicationTimer = null;

    ekg = {};

    valueAfterMedication;

    minimumValue = Infinity;

    /**
     * Constructor
     * Initializing all values
     * Creates HTML DOM Elements for the measurement section
     * @param {JSON} jsonObject 
     */
    constructor(jsonObject) {
        this.name = jsonObject.name;
        this.value = this.loadingStates[0];
        this.unit = jsonObject.unit;
        this.duration = jsonObject.duration;
        this.secondDuration = jsonObject.secondDuration;
        this.equipmentNeeded = jsonObject.equipmentNeeded;
        if (jsonObject.hasOwnProperty("range")) this.range = jsonObject.range;
        if (jsonObject.hasOwnProperty("max")) this.max = jsonObject.max;
        if (jsonObject.hasOwnProperty("min")) this.min = jsonObject.min;
        if (jsonObject.hasOwnProperty("changeBy")) this.changeBy = jsonObject.changeBy;

        if(this.name === "EKG") {
            this.ekg = {
                "normal": "Normaler Sinusrhythmus",
                "unnormal": "Ungewöhnliche Muster"
            }
        }

        this.#measurementsElement = document.querySelector("#measurements");

        this.#measurementInformationElement = document.createElement("div");
        this.#measurementInformationElement.className = "measurement-information";

        this.#measurementValueElement = document.createElement("h1");
        this.#measurementValueElement.className = "measurement-value ui center aligned tiny icon header";

        this.#measurementNameElement = document.createElement("p");
        this.#measurementNameElement.className = "measurement-name sub header";

        this.#measurementBorderElement = document.createElement("p");
        this.#measurementBorderElement.className = "measurement-borders sub header";
    }

    /**
     * Initializing and setting all init-values
     */
    initMeasurementElement() {
        this.#measurementValueElement.innerHTML = this.loadingStates[0];
        this.#measurementNameElement.innerHTML = this.name;
        if (this.name !== "EKG") {
            this.#measurementBorderElement.innerHTML = "(" + this.min + " - " + this.max + ")" + this.unit;
        }

        this.#measurementInformationElement.style.border = "2px dashed grey";

        this.#measurementInformationElement.appendChild(this.#measurementValueElement);
        this.#measurementInformationElement.appendChild(this.#measurementNameElement);
        this.#measurementInformationElement.appendChild(this.#measurementBorderElement);

        this.#measurementsElement.appendChild(this.#measurementInformationElement);
    }

    /**
     * Sets the value for the measurement and checks the border-values and colors
     * @param {any} value 
     */
    setMeasurement(value) {
        this.value = value;
        /**
         * If it is a number
         */
        if (typeof value === "number") {
            /**
             * Then find a random value between the range value
             */
            let multiplier = (Math.random() > 0.5) ? 1 : -1;
            value += Math.floor(Math.random() * (this.range * multiplier));

            /**
             * Then check the borders and define a color
             */
            if (value > this.max || value < this.min) this.color = "red";
            else this.color = "green";

            /**
             * Sets the value to the HTML DOM
             */
            (this.name === "Temperatur") ? this.#measurementValueElement.innerHTML = value.toFixed(1) + this.unit : this.#measurementValueElement.innerHTML = Math.floor(value) + this.unit;
            this.#measurementInformationElement.style.border = "2px dashed " + this.color;
        } else {
            /**
             * If it is not a number...
             * If it is the EKG, then simply set the value to the DOM
             */
            if (this.name === "EKG") {
                this.#measurementValueElement.innerHTML = value + this.unit;
                if(value === this.ekg.normal) this.color = "green";
                else if(value === this.ekg.unnormal) this.color = "red";
                this.#measurementInformationElement.style.border = "2px dashed " + this.color;
            } else if (this.name === "Blutdruck") {
                /**
                 * If it is the "Blutdruck", then split the value (for example "180 / 100" => systole = 180; diastole = 100)
                 */
                let bloodPressure = value.split("/");
                let systole = parseInt(bloodPressure[0]);
                let diastole = parseInt(bloodPressure[1]);

                /**
                 * Split the value of the max borders
                 */
                let maxBorders = this.max.split("/");
                let maxSystole = parseInt(maxBorders[0]);
                let maxDiastole = parseInt(maxBorders[1]);

                /**
                 * Split the values for the min borders
                 */
                let minBorders = this.min.split("/");
                let minSystole = parseInt(minBorders[0]);
                let minDiastole = parseInt(minBorders[1]);

                /**
                 * Check the borders and define the colors
                 */
                if ((systole > maxSystole || systole < minSystole) && (diastole > maxDiastole || diastole < minDiastole)) this.color = "red";
                else if (((systole > maxSystole || systole < minSystole) && !(diastole > maxDiastole || diastole < minDiastole)) ||
                    (!(systole > maxSystole || systole < minSystole) && (diastole > maxDiastole || diastole < minDiastole))) this.color = "orange";
                else this.color = "green";

                /**
                 * Set the value to the DOM
                 */
                this.#measurementValueElement.innerHTML = Math.floor(systole) + " / " + Math.floor(diastole) + this.unit;
                this.#measurementInformationElement.style.border = "2px dashed " + this.color;
            }
        }
    }

    indicateLoadingState(currentSeconds, pending) {
        if (!pending) {
            this.#measurementValueElement.innerHTML = this.loadingStates[this.currentLoadingState];
            this.#measurementInformationElement.style.borderColor = "grey";
            this.currentLoadingState++;

            let countdown = Math.ceil(this.duration - (currentSeconds / 1000));
            if (this.name === "EKG") this.#measurementBorderElement.style.display = "block";
            this.#measurementBorderElement.innerHTML = "noch " + countdown + " Sekunden";
            this.#measurementBorderElement.style.color = "green";

            if (this.currentLoadingState > this.loadingStates.length - 1) {
                this.currentLoadingState = 0;
            }
            if (countdown <= 0) {
                this.#measurementBorderElement.innerHTML = "(" + this.min + " - " + this.max + ")" + this.unit;
                this.#measurementBorderElement.style.color = "grey";
                if (this.name === "EKG") this.#measurementBorderElement.style.display = "none";
            }
        } else {
            if (this.name === "EKG") this.#measurementBorderElement.style.display = "block";
            this.#measurementBorderElement.innerHTML = "Auf andere Messung warten...";
            this.#measurementBorderElement.style.color = "red";
        }
    }
}