import { colorEvailable } from "./constants.js";
import Game from '../app.js'
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

export default class Room {

   /**
    * @param {HTMLDivElement} html_dom
    * @param {room_info_typedef} room_info
    * @param {Game} main_this
    */
   constructor(html_dom, room_info, main_this) {
      this.html_dom = html_dom;
      this.room_info = room_info;
      this.main_this = main_this;

      // @ts-ignore
      this.html_dom.querySelector("#room-id").innerText = this.room_info["id"];

      for (const key in colorEvailable) {
         // @ts-ignore
         this.html_dom.querySelector(`#${key}`).innerText = this.room_info[key];
      }

      /**
       * @type {HTMLButtonElement}
       */
      // @ts-ignore
      this.button = this.html_dom.querySelector(".submit-room-button");
   }

   /**
    * @param {(val:room_info_typedef) => void} resolve
    */
   set_event(resolve) {


      this.button.onclick = () => {
         if (this.main_this.input_is_blank) return;

         resolve(this.room_info)
      }
   }
}