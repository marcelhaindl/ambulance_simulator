/**
 * Show the start screen
 */
export function showStartScreen() {
    document.querySelector("#start-screen").style.display = "flex";
    document.querySelector("#game-area").style.display = "none";
    document.querySelector("#survived-screen").style.display = "none";
    document.querySelector("#died-screen").style.display = "none";
}

/**
 * Show the phone screen
 */
export function showPhone() {
    document.querySelector("#start-screen").style.display = "none";

    document.querySelector("#game-area").style.display = "flex";
    document.querySelector("#phone").style.display = "flex";
    document.querySelector("#while-driving").style.display = "none";
    document.querySelector("#at-the-patient").style.display = "none";

    document.querySelector("#survived-screen").style.display = "none";
    document.querySelector("#died-screen").style.display = "none";
}

/**
 * Show the driving / equipment screen
 */
export function showDriving() {
    document.querySelector("#start-screen").style.display = "none";

    document.querySelector("#game-area").style.display = "flex";
    document.querySelector("#phone").style.display = "none";
    document.querySelector("#while-driving").style.display = "flex";
    document.querySelector("#at-the-patient").style.display = "none";

    document.querySelector("#survived-screen").style.display = "none";
    document.querySelector("#died-screen").style.display = "none";
}

/**
 * Show the patient screen
 */
export function showPatient() {
    document.querySelector("#start-screen").style.display = "none";

    document.querySelector("#game-area").style.display = "flex";
    document.querySelector("#phone").style.display = "none";
    document.querySelector("#while-driving").style.display = "none";
    document.querySelector("#at-the-patient").style.display = "flex";

    document.querySelector("#survived-screen").style.display = "none";
    document.querySelector("#died-screen").style.display = "none";
}

/**
 * Show the died screen
 */
export function showDiedScreen() {
    document.querySelector("#start-screen").style.display = "none";
    document.querySelector("#game-area").style.display = "none";
    document.querySelector("#at-the-patient").style.display = "none";
    document.querySelector("#survived-screen").style.display = "none";
    document.querySelector("#died-screen").style.display = "flex";
    document.querySelector("#retry-died").onclick = () => {
        location.reload();
    }
}

/**
 * Show the end screen
 */
export function showSurvivedScreen() {
    document.querySelector("#start-screen").style.display = "none";
    document.querySelector("#game-area").style.display = "none";
    document.querySelector("#at-the-patient").style.display = "none";
    document.querySelector("#died-screen").style.display = "none";
    document.querySelector("#survived-screen").style.display = "flex";
    document.querySelector("#retry-survived").onclick = () => {
        location.reload();
    }
}
