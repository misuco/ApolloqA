class aqa_menu {
    constructor() {
        const _this=this;
        
        this.menu_hidden=false;
        
        const menu_main_button = document.querySelector("#menu_main");
        const menu_session_button = document.querySelector("#menu_session");
        const menu_mic_button = document.querySelector("#menu_mic");

        menu_main_button.onclick = this.toggleMenu;
        menu_session_button.onclick = this.toggleSession;
        menu_mic_button.onclick = this.toggleMic;
        
        const range_bpm = document.querySelector("#range_bpm");
        range_bpm.addEventListener("input", (event) => {
            this.updateBpmValue(event.target.value);
        });
        
        const inc_bpm = document.querySelector("#inc_bpm");
        inc_bpm.onclick = this.incBpm;
        
        const dec_bpm = document.querySelector("#dec_bpm");
        dec_bpm.onclick = this.decBpm;
        
        this.calc_button = [];
        this.calc_button[0] = document.querySelector("#calc1");
        this.calc_button[1] = document.querySelector("#calc2");
        this.calc_button[2] = document.querySelector("#calc3");
        this.calc_button[3] = document.querySelector("#calc4");

        this.calc_button[0].onclick = function() {_this.setCalcButtonColor(0,"orange"); triggerNewSound(0);};
        this.calc_button[1].onclick = function() {_this.calc_button[1].style.background = "orange"; triggerNewSound(1);};
        this.calc_button[2].onclick = function() {_this.calc_button[2].style.background = "orange"; triggerNewSound(2);};
        this.calc_button[3].onclick = function() {_this.calc_button[3].style.background = "orange"; triggerNewSound(3);};
        
    }

    setCalcButtonColor(i,c) {
        this.calc_button[i].style.background=c;
    }
    
    incBpm() {
        const range_bpm = document.querySelector("#range_bpm");
        let new_value = range_bpm.value;
        new_value++;
        range_bpm.value=new_value;
        
        const display_bpm = document.querySelector("#display_bpm");
        display_bpm.textContent=new_value;
    }
    
    decBpm() {
        const range_bpm = document.querySelector("#range_bpm");
        const new_value = range_bpm.value-1;
        range_bpm.value=new_value;
        
        const display_bpm = document.querySelector("#display_bpm");
        display_bpm.textContent=new_value;
    }
    
    updateBpmValue(v) {
        const display_bpm = document.querySelector("#display_bpm");
        display_bpm.textContent=v;
    }
    
    toggleMic () {
        const div_mic = document.querySelector("#config_mic");
        div_mic.hidden=!div_mic.hidden;
    }
        
    toggleSession() {
        const div_session = document.querySelector("#config_session");
        let hidden=div_session.hidden;
        div_session.hidden=!hidden;
        console.log("toggleSession "+hidden);
    }
    
    toggleMenu () {
        console.log("menu_main_button.onclick");
        this.menu_hidden=!this.menu_hidden;
        
        const menu_gen_1_button = document.querySelector("#menu_gen_1");
        const menu_gen_2_button = document.querySelector("#menu_gen_2");
        const menu_gen_3_button = document.querySelector("#menu_gen_3");
        const menu_gen_4_button = document.querySelector("#menu_gen_4");
        const menu_session_button = document.querySelector("#menu_session");
        const menu_mic_button = document.querySelector("#menu_mic");

        menu_session_button.hidden=this.menu_hidden;
        menu_mic_button.hidden=this.menu_hidden;
        menu_gen_1_button.hidden=this.menu_hidden;
        menu_gen_2_button.hidden=this.menu_hidden;
        menu_gen_3_button.hidden=this.menu_hidden;
        menu_gen_4_button.hidden=this.menu_hidden;
        
        const bpm_range = document.querySelector("#range_bpm");

    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    aqa.htmlGui=new aqa_menu();
});