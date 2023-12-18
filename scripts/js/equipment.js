export default class Equipment {
    // Variables
    image = new Image();
    #flexbox = document.createElement("div");
    #imageName = document.createElement("p");
    name; 

    isChecked = false;

    /**
     * # Constructor
     * Initializing all values
     * Adds every equipment as a button to the HTML DOM and adds an event listener for every equipment object
     * 
     * @param {JSON} jsonObject 
     */
    constructor(jsonObject) {
        this.name = jsonObject.name;

        this.image.src = jsonObject.image;
        this.#imageName.innerHTML = this.name;
        this.#flexbox.className = "equipment-flexbox";
        this.#flexbox.appendChild(this.image);
        this.#flexbox.appendChild(this.#imageName);

        this.#flexbox.addEventListener("click", () => {
            this.isChecked = !this.isChecked;
            if(this.isChecked) {
                this.#flexbox.style.backgroundColor = "#d1ffcf";
                this.#imageName.style.color = "black";
            } else {
                this.#flexbox.style.backgroundColor = "whitesmoke"
                this.#imageName.style.color = "grey"
            }
        })
    }

    /**
     * # addImage()
     * Adds the image to the html container
     */
    addImage() {
        document.querySelector("#equipment").appendChild(this.#flexbox);
    }
}