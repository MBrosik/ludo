// @ts-nocheck
"use-strict"

import { importHTMLFile, preloader, use_sleep } from "./modules/tools.js";
import { GameCanvas } from './modules/canvas/game_canvas.js';
import { colorEvailable, requestTime } from './modules/constants.js'
import { dice_3d } from "./modules/dice_3d.js";
import Room from "./modules/room.js"


class Game {
   constructor() {

      this.checkSession();
   }
   async checkSession() {

      preloader();


      // --------------------------
      // check for game status
      // --------------------------      
      let data = await fetch("./php/check_session.php")
         .then(res => res.json())

      if (!data.sessionExists) {


         // ----------------------
         // session not exists
         // ----------------------
         await this.createInput();
      }
      else {
         /**
          * @type {{name:String, selectedColor:String}}
          */
         this.userData = {
            name: data.playerName,
            selectedColor: data.selectedColor
         }
         await this.createGameRoom();

         if (data.game_phase == 1) {


            // ----------------------
            // preparation phase
            // ----------------------
            if (data.userArray.ready_for_game == 1) {
               // @ts-ignore
               this.checkbox = this.gameContainer.querySelector("#be-ready-input");
               this.checkbox.checked = true;
               this.checkboxfun()
            }
            await this.gameRoomBeforeStart()
         }
         else if (data.game_phase == 2) {


            // -----------------
            // game is running
            // -----------------
            await this.gameRoomBeforeStart(false);
         }
      }
   }
   async createInput() {
      /**
       * @typedef {{
       *    player_name:String,
       *    selectedColor:String,
       *    "room_found":boolean
       * }} data_fetch
       */



      // ----------------
      // create input
      // ----------------
      let html_input = await importHTMLFile('./templates/inputName.html');
      document.body.appendChild(html_input)

      let input_name = document.getElementById("input-name");
      this.input_is_blank = true;

      input_name.oninput = (e) => {
         this.input_is_blank = e.currentTarget.value == "";
      }


      html_input.querySelector("#random-button").onclick = async (e) => {
         if (this.input_is_blank) return;

         let playerName = encodeURIComponent(input_name.value);


         // ---------------------------------
         // send name to the server          
         // ---------------------------------

         /**@type {data_fetch} */
         let data = await fetch("./php/check_for_room.php", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: playerName })
         })
            .then(response => response.json())
            .catch(err => location.reload());


         this.userData = {
            name: data.player_name,
            selectedColor: data.selectedColor,
         }
         this.afterInput();

      }

      html_input.querySelector("#create-room-button").onclick = async () => {
         if (this.input_is_blank) return;

         let playerName = encodeURIComponent(input_name.value);

         /**@type {data_fetch} */
         let data = await fetch("./php/rooms_manage/create_room.php", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: playerName })
         })
            .then(response => response.json())
            .catch(err => location.reload())

         this.userData = {
            name: data.player_name,
            selectedColor: data.selectedColor,
         }
         this.afterInput();
      }


      // ----------------------
      // room rows
      // ----------------------

      /**
       * 
       * @typedef {{
       *    "id":Number,
       *    "red_player":String,
       *    "blue_player":String,
       *    "green_player":String,
       *    "yellow_player":String
       * }} room_info_typedef
       */



      let room_row_template = await importHTMLFile("./templates/room.html");


      // -------------------------------
      // check available rooms interval
      // -------------------------------

      let join_room_fun = async () => {


         /** @type {room_info_typedef[]} */
         let possible_rooms = await fetch("./php/rooms_manage/get_rooms.php")
            .then(response => response.json())
            .catch(err => location.reload());

         // -----------
         // promises
         // -----------

         html_input.querySelector("#rooms-span").innerHTML = "";

         /**
          * @type {Promise<room_info_typedef>[]}
          */
         let PromiseList = []

         possible_rooms.forEach(el => {
            let room_div = room_row_template.cloneNode(true);
            html_input.querySelector("#rooms-span").appendChild(room_div);

            let room = new Room(room_div, el, this);

            PromiseList.push(new Promise(
               resolve => {
                  room.set_event(resolve)
               }
            ));
         })

         let value = await Promise.race(PromiseList);




         // ------------------
         // join room fetch
         // ------------------
         let playerName = encodeURIComponent(input_name.value);

         /**@type {data_fetch} */
         let data = await fetch("./php/rooms_manage/join_room.php", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
               ...value,
               name: playerName
            })
         }).then(response => response.json())
            .catch(err => location.reload());



         if (data["room_found"] != false) {


            // ---------------
            // receive data
            // ---------------

            this.userData = {
               name: data.player_name,
               selectedColor: data.selectedColor,
            }
            this.afterInput();

         }
         else {
            join_room_fun();
         }

      }

      join_room_fun();

      this.join_room_interval = setInterval(join_room_fun.bind(this), 3000)
   }

   async afterInput() {

      if (this.join_room_interval != undefined) clearInterval(this.join_room_interval);

      await this.createGameRoom();
      await this.gameRoomBeforeStart()
   }

   async createGameRoom() {

      let game_container_html = await importHTMLFile('./templates/gameContainer.html');
      let exit_window_html = await importHTMLFile("./templates/exit_window.html");

      document.body.innerHTML = "";
      document.body.appendChild(game_container_html)
      this.gameContainer = game_container_html;

      this.gameContainer.querySelector(`#${this.userData.selectedColor}`).classList.add("joined")
      this.gameContainer.querySelector(`#${this.userData.selectedColor}`).innerText = this.userData.name


      let exit_button_window = exit_window_html.querySelector("#exit-submit");
      let cancel_button_window = exit_window_html.querySelector("#exit-cancel");
      let exit_button = this.gameContainer.querySelector("#exit-button");

      exit_button_window.onclick = async () => {
         await fetch("./php/rooms_manage/exit_room.php");

         location.reload();
      }
      cancel_button_window.onclick = () => {
         exit_window_html.remove()
      }

      exit_button.onclick = () => {
         document.body.appendChild(exit_window_html);
      }

      // ---------------
      // create canvas
      // ---------------
      this.gameCanvas = new GameCanvas(this, game_container_html.querySelector("canvas"), game_container_html.querySelector("#canvas-content"))

   }

   //* -----------------------
   //* gameroom before start
   //* -----------------------
   async gameRoomBeforeStart(interval_bool = true) {
      // ------------------------
      // checkbox event listener
      // ------------------------

      /**
       * @type {HTMLInputElement}
       */

      // @ts-ignore
      this.checkbox = this.gameContainer.querySelector("#be-ready-input");

      this.checkbox.onchange = () => {

         fetch("./php/before_game/send_ready_status.php", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({ ready_for_game: (this.checkbox.checked) ? 1 : 0 })
         })
            .then(response => response.text())
            .then(data => { })
            .catch(err => location.reload());
         this.checkboxfun()
      }

      this.intervalfunBefore(false);
      if (interval_bool) {
         this.intervalBefore = setInterval(() => { this.intervalfunBefore(true) }, requestTime)
      }
   }

   async intervalfunBefore(interval_bool) {
      /**
       * @type {{
       *    game_phase:Number, 
       *    players:{
       *       red_player:{name:String, ready_for_game:"0"|"1"}|null,
       *       blue_player:{name:String, ready_for_game:"0"|"1"}|null,
       *       green_player:{name:String, ready_for_game:"0"|"1"}|null,
       *       yellow_player:{name:String, ready_for_game:"0"|"1"}|null,
       *    }
       * }
       * }
       */
      let data = await fetch("./php/before_game/check_status.php")
         .then(res => res.json())
         .catch(err => location.reload());

      for (const key in data["players"]) {
         if (data["players"][key] != null) {
            this.gameContainer.querySelector(`#${key}`).classList.add("joined");
            this.gameContainer.querySelector(`#${key}`).innerText = data["players"][key].name;
            if (data["players"][key].ready_for_game == 1) {
               this.gameContainer.querySelector(`#${key}`).classList.add("ready")
            }
            else {
               this.gameContainer.querySelector(`#${key}`).classList.remove("ready")
            }
         }
         else {
            this.gameContainer.querySelector(`#${key}`).classList.remove("joined");
            this.gameContainer.querySelector(`#${key}`).classList.remove("ready")
            this.gameContainer.querySelector(`#${key}`).innerText = "?";
         }
      }
      if (data["game_phase"] == 2) {
         this.gameRoomWhilePlay();
         if (interval_bool) {
            clearInterval(this.intervalBefore);
         }
      }
   }

   checkboxfun() {
      if (this.checkbox.checked) {
         this.gameContainer.querySelector("#be-ready-span").innerHTML = "Gotowy";
         this.gameContainer.querySelector(`#${this.userData.selectedColor}`).classList.add("ready")
      }
      else {
         this.gameContainer.querySelector("#be-ready-span").innerHTML = "Niegotowy";
         this.gameContainer.querySelector(`#${this.userData.selectedColor}`).classList.remove("ready")
      }
   }





   //* -------------------------
   //* gameRoom while game
   //* -------------------------   

   async gameRoomWhilePlay() {
      // ------------------
      // import 3d dice
      // ------------------
      let dice_3d_html = await importHTMLFile("./templates/dice_3d.html");
      this.gameContainer.querySelector("#canvas-content").appendChild(dice_3d_html);

      this.dice_3d_class = new dice_3d(dice_3d_html);



      // --------------
      // variables
      // --------------
      this.receivedMyTurn_Before = false;
      this.receivedMyTurn_After = false;



      // --------------
      // prepare html 
      // --------------
      this.gameContainer.querySelector("#be-ready-switch").style.display = "none";
      this.gameContainer.querySelector("#be-ready-span").style.display = "none";

      this.gameContainer.querySelectorAll(".joined").forEach(el => {
         el.classList.add("ready");
      })



      // --------------
      // set interval
      // --------------
      this.intervalFunWhilePlay();
      this.intervalWhilePlay = setInterval(() => { this.intervalFunWhilePlay() }, requestTime)
   }
   async intervalFunWhilePlay(alter_data = null) {
      // --------------
      // fetch data
      // --------------

      /*    "players_names":{
      *       "red_player":String,
      *       "blue_player":String,
      *       "green_player":String,
      *       "yellow_player":String,
      *    },
      */


      /**
       * @typedef {"red_player"|"blue_player"|"green_player"|"yellow_player"} colors
       */
      /**
       * @typedef {{
       *    "pawns":Array<{
       *       "sector":"spawnFieldsPos"|"outerFieldsPos"|"innerFieldsPos",
       *       "position":Number
       *     }>}|null} player
       */
      /**
       * @typedef {{
       *    "server_time":Number,
       *    "game_phase":Number,
       *    "whose_turn":colors,
       *    "start_round_time":Number,
       *    "count_roll_dice":Number|null,
       *    "end_time":Number|null,
       *    "last_roll":{
       *       player: colors|null,
       *       count_roll_dice: Number|null,
       *    },
       *    "players":{
       *       red_player: player,
       *       blue_player: player,
       *       green_player: player,
       *       yellow_player: player,
       *    },
       *    "winner":{
       *       color: colors,
       *       player: String
       *    }
       * }} check_status_while_play
       */

      /** @type {check_status_while_play}*/
      let data;

      if (alter_data == null) {
         let ping1 = Date.now()
         data = await fetch("./php/while_game/check_status.php")
            .then(res => res.json())
            .catch(err => location.reload())

         this.ping = (Date.now() - ping1) / 2
      }
      else {
         data = alter_data;
      }


      // ----------------------------
      // check for evailable players
      // ----------------------------
      for (const key in colorEvailable) {
         if (data["players"][key] != null) {
            this.gameContainer.querySelector(`#${key}`).classList.add("joined");
            this.gameContainer.querySelector(`#${key}`).classList.add("ready")
            this.gameContainer.querySelector(`#${key}`).innerText = decodeURIComponent(data["players"][key].name);
         }
         else {
            this.gameContainer.querySelector(`#${key}`).classList.remove("joined");
            this.gameContainer.querySelector(`#${key}`).classList.remove("ready")
            this.gameContainer.querySelector(`#${key}`).innerText = "?";
         }
      }



      // ------
      // time
      // ------
      if (data["end_time"] != null) {
         this.end_time = data["end_time"] / 1000;
      }



      // ---------------
      // delta time
      // ---------------
      this.delta_time = Date.now() - (data["server_time"] - this.ping);



      // ---------------
      // drawing pawns
      // ---------------      

      this.gameCanvas.addAllPawns(data)

      this.round_time = data["start_round_time"];




      // --------------------
      // check for win
      // --------------------
      if (data["game_phase"] == 3) {
         clearInterval(this.intervalWhilePlay)
         clearInterval(this.intervalChangeTime)
         this.endGame(data);
         return
      }




      // ------------
      // show Time
      // ------------
      if (this.playerDiv == undefined) {
         // -----------------------------
         // set timer to current player
         // -----------------------------
         this.whose_turn = data["whose_turn"]

         this.playerDiv = this.gameContainer.querySelector(`#${data["whose_turn"]}`)
         this.playerDiv.dataset.showtime = true;
         this.playerDiv.dataset.time = "";

         this.intervalChangeTime = setInterval(() => {



            // ---------------------
            // change time interval
            // ---------------------

            if (this.round_time != undefined && this.end_time != undefined) {
               let real_time = Date.now() - this.delta_time;
               // let time = 60 - Math.floor((real_time - this.round_time) / 1000);
               let time = Math.floor(this.end_time - (real_time - this.round_time) / 1000);
               this.playerDiv.dataset.time = time.clamp(0, this.end_time);
            }
         }, 700)
      }




      if (this.whose_turn != data["whose_turn"]) {
         // -------------------------
         // change position of timer
         // -------------------------
         this.whose_turn = data["whose_turn"];
         this.playerDiv.dataset.showtime = false

         this.playerDiv = this.gameContainer.querySelector(`#${data["whose_turn"]}`)
         this.playerDiv.dataset.showtime = true

         if (this.round_time != undefined && this.end_time != undefined) {
            let real_time = Date.now() - this.delta_time;
            let time = Math.floor(this.end_time - (real_time - this.round_time) / 1000);
            this.playerDiv.dataset.time = time.clamp(0, this.end_time);
         }
      }




      // ----------------------------------
      // check whose turn and do something
      // ----------------------------------
      if (data["whose_turn"] == this.userData.selectedColor) {
         // --------------
         // if my turn
         // --------------


         if (data["count_roll_dice"] == null && !this.receivedMyTurn_Before) {
            // --------------
            // if not rolled
            // --------------            

            this.receivedMyTurn_Before = true


            let last_roll = data["count_roll_dice"] == null;
            let count = (last_roll)
               ? data["last_roll"]["count_roll_dice"]
               : data["count_roll_dice"];

            this.dice_3d_class.change_pos(count, data["last_roll"]["player"], last_roll)

            this.rollButton = document.createElement("button");
            this.rollButton.innerHTML = "Rzuć kostką"
            this.rollButton.classList.add("roll-button")
            this.rollButton.onclick = this.sendRollInfo.bind(this)

            this.gameContainer.querySelector("#canvas-content").appendChild(this.rollButton);

         }
         else if (data["count_roll_dice"] != null && !this.receivedMyTurn_After) {


            // --------------
            // if rolled
            // --------------
            this.afterRoll(data)
         }
      }
      else if (data["whose_turn"] != this.userData.selectedColor) {


         // -------------------
         // if not my turn
         // -------------------
         this.gameCanvas.delete_div_pawns();
         this.rollButton?.remove();

         await this.afterRoll(data)

         this.receivedMyTurn_Before = false;
         this.receivedMyTurn_After = false;
      }
   }

   /**
    * @typedef {Object} roll_data
    * @property {Number} count_roll_dice
    * @property {String} whose_turn
    * @property {{
    *       player: colors|null,
    *       count_roll_dice: Number|null,
    *    }} last_roll
    */
   async sendRollInfo() {

      this.rollButton?.remove();
      /** @type {roll_data}*/
      let data = await fetch("./php/while_game/roll_dice.php")
         .then(res => res.json())
         .catch(err => location.reload());

      let count = (data["count_roll_dice"] == null)
         ? data["last_roll"]["count_roll_dice"]
         : data["count_roll_dice"];


      // await use_sleep(1000)

      setTimeout(() => {
         let utterance = new SpeechSynthesisUtterance(count);
         utterance.voice = speechSynthesis.getVoices().find(el => el.lang == "pl-PL");
         speechSynthesis.speak(utterance)
      }, 800)

      this.afterRoll(data, true);
   }

   /**
    * 
    * @param {check_status_while_play } data    
    */
   async afterRoll(data, player_roll_bool = false) {
      this.receivedMyTurn_After = true;
      this.rollButton?.remove();

      let last_roll = data["count_roll_dice"] == null;
      let count = (last_roll)
         ? data["last_roll"]["count_roll_dice"]
         : data["count_roll_dice"];

      let rool_bool2 = player_roll_bool/* && !last_roll*/;

      if (player_roll_bool && last_roll) {
         console.log(new Date())
         console.log(last_roll)
      }

      // this.dice_3d_class.change_pos(count, data["last_roll"]["player"], last_roll, player_roll_bool);
      this.dice_3d_class.change_pos(count, data["last_roll"]["player"], last_roll, rool_bool2);


      if (data["whose_turn"] == this.userData.selectedColor) {

         await use_sleep(1000);
         /**
          * @type {null|Number}
          */
         let move_pawn_info = await this.gameCanvas.movePawnsListener(data["count_roll_dice"])
         console.log('move_pawn_info :>> ', move_pawn_info);

         if (move_pawn_info == false) {

         }

         // --------------
         // send move id
         // --------------

         let ping1 = Date.now();
         /**
          * @type {check_status_while_play}
          */
         let send_data = await fetch("./php/while_game/move_pawn.php", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({ pawn_id: move_pawn_info })
         })
            .then(response => response.json())
            .catch(err => location.reload());

         this.ping = (Date.now() - ping1) / 2

         await this.intervalFunWhilePlay(send_data);
      }
   }

   // --------------------------
   // endgame
   // --------------------------

   /**
    * 
    * @param {check_status_while_play} data 
    */
   async endGame(data) {
      this.end_game_container = await importHTMLFile("./templates/endGame.html");
      this.end_game_container.querySelector("#current-player").innerText = this.userData.name;
      this.end_game_container.querySelector("#current-player").classList.add(this.userData.selectedColor);

      let end_info = this.userData.selectedColor == data.winner.color
         ? "Wygrałeś"
         : "Przegrałeś"
      this.end_game_container.querySelector("#info-span").innerText = end_info;

      if (end_info == "Przegrałeś") {
         this.end_game_container.querySelector("#winner-container").style.opacity = 1;

         this.end_game_container.querySelector("#winner-name").innerText = data.winner.player;
         this.end_game_container.querySelector("#winner-name").classList.add(data.winner.color);
      }

      document.body.appendChild(this.end_game_container);


      setTimeout(() => { this.gameContainer.style.display = "none" }, 3000);
   }
}


// -------------------
// Override methods
// -------------------

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function (min, max) {
   return Math.min(Math.max(this, min), max);
};


let app;
window.addEventListener('load', () => {
   app = new Game()
   // console.log('app :>> ', app);
   // window.app = app
})

export default Game