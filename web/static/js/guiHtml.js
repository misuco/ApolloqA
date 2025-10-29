class aqa_menu {
    constructor() {
        this.menu_hidden=false;
        
        this.menu_gen_1_button = document.querySelector("#menu_gen_1");
        this.menu_gen_2_button = document.querySelector("#menu_gen_2");
        this.menu_gen_3_button = document.querySelector("#menu_gen_3");
        this.menu_gen_4_button = document.querySelector("#menu_gen_4");

        this.menu_session_button = document.querySelector("#menu_session");
        this.div_session = document.querySelector("#config_session");
        this.menu_session_button.addEventListener("click", () => {this.div_session.hidden=!this.div_session.hidden});
        
        this.menu_mic_button = document.querySelector("#menu_mic");
        this.div_mic = document.querySelector("#config_mic");
        this.menu_mic_button.addEventListener("click", () => {this.div_mic.hidden=!this.div_mic.hidden});

        this.menu_main_button = document.querySelector("#menu_main");
        this.menu_main_button.addEventListener("click", () => {this.toggleMenu()});

        this.chords_select = document.querySelector("#chords");
        this.display_bpm = document.querySelector("#display_bpm");
        this.range_bpm = document.querySelector("#range_bpm");
        this.range_bpm.addEventListener("input", (event) => this.updateBpmValue(event.target.value));

        this.inc_bpm = document.querySelector("#inc_bpm");
        this.inc_bpm.addEventListener("click", (event) => this.incBpmValue());

        this.dec_bpm = document.querySelector("#dec_bpm");
        this.dec_bpm.addEventListener("click", (event) => this.decBpmValue());

        this.calc_button = [];
        this.calc_button[0] = document.querySelector("#calc0");
        this.calc_button[1] = document.querySelector("#calc1");
        this.calc_button[2] = document.querySelector("#calc2");
        this.calc_button[3] = document.querySelector("#calc3");

        this.calc_button[0].addEventListener("click", () => this.triggerCalc(0));
        this.calc_button[1].addEventListener("click", () => this.triggerCalc(1));
        this.calc_button[2].addEventListener("click", () => this.triggerCalc(2));
        this.calc_button[3].addEventListener("click", () => this.triggerCalc(3));
    }
    
    toggleMenu() {
        this.menu_hidden=!this.menu_hidden;
        this.menu_session_button.hidden=this.menu_hidden;
        this.menu_mic_button.hidden=this.menu_hidden;
        this.menu_gen_1_button.hidden=this.menu_hidden;
        this.menu_gen_2_button.hidden=this.menu_hidden;
        this.menu_gen_3_button.hidden=this.menu_hidden;
        this.menu_gen_4_button.hidden=this.menu_hidden;
    }

    setCalcButtonColor(i,c) {
        this.calc_button[i].style.background=c;
    }

    triggerCalc(i) {
        this.setCalcButtonColor(i,"orange"); 
        triggerNewSound(i);
    }
    
    incBpmValue() {
        const currentBpm=Number(this.display_bpm.textContent);
        if(currentBpm<240) {
            this.updateBpmValue(currentBpm+1);
        }
    }
    
    decBpmValue() {
        const currentBpm=Number(this.display_bpm.textContent);
        if(currentBpm>40) {
            this.updateBpmValue(currentBpm-1);
        }
    }
    
    updateBpmValue(newTempo) {
        aqa.tempo=newTempo;
        this.display_bpm.textContent=newTempo;
    }
    
    get chords() {
        const selected_chord = this.chords_select.value;
        return selected_chord;
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    aqa.htmlGui=new aqa_menu();
});