import { dice_3d_pos } from './constants.js'

export class dice_3d {
   /**
    * 
    * @param {HTMLDivElement} dice_container 
    */
   constructor(dice_container) {
      this.dice_container = dice_container;
      /**
       * @type {HTMLDivElement}
       */
      // @ts-ignore
      this.dice = dice_container.querySelector(".dice");

      this.last_number = 6;
      this.player = null;

      this.rool_bool = true;

      this.base_degree = 0;
   }





   /**
    * @param {1 | 2 | 3 | 4 | 5 | 6} pos_number
    * @param {string} player
    * @param {boolean} last_roll
    */
   change_pos(pos_number, player, last_roll, player_roll_bool = false) {
      if (pos_number == null) return;

      if (player_roll_bool) this.base_degree += 360 * 3;

      let { x, y, z } = dice_3d_pos[pos_number];

      if (
         this.last_number == pos_number &&
         this.last_player != player

      ) {
         this.base_degree += 360;
         let new_x = x + this.base_degree;
         let new_y = y + this.base_degree;
         let new_z = z + this.base_degree;
         this.dice.style.transform = `rotateX(${new_x}deg) rotateY(${new_y}deg) rotateZ(${new_z}deg)`

      }
      else {
         this.dice.style.transform = `rotateX(${x + this.base_degree}deg) rotateY(${y + this.base_degree}deg) rotateZ(${z + this.base_degree}deg)`
         this.rool_bool = true;
      }

      this.last_player = player;
      this.last_number = pos_number;
      this.last_last_roll = last_roll;
   }

}