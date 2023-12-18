import * as utils from "./utils.js";

export default class Abstransport {
    // Variables
    healthBar;
    minutesToHospital = 0;
    isShown = true;

    /**
     * # Constructor
     * Initializing and setting up all needed values and functions
     * @param {Object} healthBar - the health bar object
     */
    constructor(healthBar, status) {
        // assign healthBar to the class property
        this.healthBar = healthBar;
        // attach click event to the "drive" button
        document.querySelector("#drive-btn").addEventListener("click", () => {
            // calculate the survival probability of the patient
            let probability = this.calculateSurvivalProbability(healthBar.prevHealthChanger);
            // update the description header and text in the "drive" popup
            document.querySelector("#popup-drive-description-header").innerHTML = "Beim Abtransport hat der Patient eine Überlebenschance von " + Math.round((1 - probability) * 100) + "%";
            document.querySelector("#popup-drive-description-text").innerHTML = "Möchtest du fortfahren?";

            // show the first button in the "drive" popup and display the popup
            document.querySelector("#popup-drive-btn1").style.display = "inline";
            $("#popup-drive").modal('show');

            // attach click event to the first button in the "drive" popup
            document.querySelector("#popup-drive-btn1").onclick = () => {
                // hide the popup
                this.hide();
                status.setStatus(5);
                this.isShown = false;
                // check if the patient survived
                if (this.patientHasSurvived(probability)) {
                    // show the "survived" screen and hide the popup
                    utils.showSurvivedScreen();
                    $("#popup-drive").modal('hide');
                } else {
                    // show the "died" screen and hide the popup
                    utils.showDiedScreen();
                    $("#popup-drive").modal('hide');
                }
            }
        });
    }

    /**
     * # show()
     * Show the Abtransport Field on screen
     */
    show() {
        if(this.isShown) document.querySelector("#drive").style.display = "flex";
    }

    /**
     * # hide()
     * Hides the Abtransport Field
     */
    hide() {
        document.querySelector("#drive").style.display = "none";
    }

    /**
     * # patientHasSurvived()
     * Returns true or false based on probability
     * @param {number} probability Probability of survival
     * @returns {boolean} Returns true if the patient survived, false otherwise
     */
    patientHasSurvived(probability) {
        return !(Math.random() < probability)
    }

    /**
     * calculateSurvivalProbability()
     * Calculates the survival probability of the patient based on their health changer value using the Sigmoid Function
     * @param {number} healthChanger - The health changer value of the patient
     * @returns {number} - The calculated survival probability
     */
    calculateSurvivalProbability(healthChanger) {
        let probability;

        // If health changer is less than or equal to 0, the probability is 0
        if (healthChanger <= 0) {
            probability = 0;
        } else {
            // Calculation of probability based on health changer value using logistic function
            const maxProbability = 1;
            const minProbability = 0;
            const k = 0.025;
            const x0 = 180;

            const exponent = -k * (healthChanger - x0);
            probability = minProbability + (maxProbability - minProbability) / (1 + Math.exp(exponent));
        }

        return probability;
    }
}
