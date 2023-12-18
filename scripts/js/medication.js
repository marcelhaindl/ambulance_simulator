// https://rdmed.n.roteskreuz.at/books/arzneimittel-nef-rtw/page/acetylsalicylsaure-ass
export default class Medication {
    // Variables
    name;
    wirkstoffe;
    indikationen;
    kontraindikationen;
    auswirkungen;
    nebenwirkungen;

    /**
     * # Constructor
     * 
     * Initializing all variables that are needed for the medication
     * @param {JSON} jsonObject - json object of the medication
     */
    constructor(jsonObject) {
        this.name = jsonObject.name;
        this.wirkstoffe = jsonObject.wirkstoffe;
        this.indikationen = jsonObject.indikationen;
        this.kontraindikationen = jsonObject.kontraindikationen;
        this.auswirkungen = jsonObject.auswirkungen;
        this.nebenwirkungen = jsonObject.nebenwirkungen;
    }
}