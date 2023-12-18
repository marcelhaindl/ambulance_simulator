export default class PatientImage {
    // Variables
    images = ["fever_1.png", "fever_2.png", "fever_3.png", "ill.png", "inject.png", "patient.png", "vomit.png"];
    randomImage;
    folderPath = "./images/illustrations/patient/";
    imageElement;

    /**
     * # Constructor
     * Chooses a random image and sets the random image to the DOM
     */
    constructor() {
        this.imageElement = document.querySelector("#patient");
        this.randomImage = this.folderPath + this.images[Math.floor(Math.random() * this.images.length)];
        this.imageElement.src = this.randomImage;
    }
}