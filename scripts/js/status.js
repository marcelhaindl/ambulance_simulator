export default class Status {
    // Variables
    statusArray = [];
    #statusElement;
    #statusTextElement;
    #statusIconElement;
    #statusSubTextElement;
    #statusColors = ["green", "olive", "yellow", "orange", "pink", "purple"];

    /**
     * # Constructor
     * 
     * Constructor for initializing all html elements and
     * fetching the status json file and save it into the statusArray
     */    
    constructor() {
        this.#statusElement = document.querySelector("#status")
        this.#statusTextElement = document.querySelector("#status-text");
        this.#statusIconElement = document.querySelector("#status-icon");
        this.#statusSubTextElement = document.querySelector("#status-sub-text");
        fetch("./scripts/json/status.json").then((response) => response.json()).then((json) => {
            this.statusArray = json;
        });
    }

    /**
     * # setStatus(status)
     * 
     * Sets the settings for the current status
     * 
     * @param {Number} status Status Number of the statusArray
     */
    setStatus(status) {
        // status--, because 1 should be "Frei Wache", 2 should be "zum Berufungsort" ...
        status--;

        // Set border of status element
        this.#statusElement.style.border = "2px dashed " + this.statusArray[status].color;

        // Set Status name
        this.#statusTextElement.innerHTML = this.statusArray[status].name;

        // Replace color of previous status with the current status
        for (let i = 0; i < this.#statusColors.length; i++) {
            if (this.#statusIconElement.classList.contains(this.#statusColors[i])) {
                this.#statusIconElement.classList.remove(this.#statusColors[i]);
            }
        }
        this.#statusIconElement.classList.add(this.statusArray[status].color);

        // Set the status number if existing
        if (this.statusArray[status].hasOwnProperty("status")) {
            this.#statusSubTextElement.innerHTML = "Status " + this.statusArray[status].status;
        } else {
            this.#statusSubTextElement.innerHTML = "";
        }
    }
}