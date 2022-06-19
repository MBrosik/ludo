// @ts-nocheck
"use-strict"
import Game from '../../app.js'
import Pawn from './pawn.js';

import { colorEvailable, FieldsPos, importantFields } from "../constants.js";
import { getPos } from '../tools.js';

export class GameCanvas {
   /**
    * @param {Game} mainClass 
    * @param {HTMLCanvasElement} canvasEL 
    * @param {HTMLDivElement} canvas_div
    */
   constructor(mainClass, canvasEL, canvas_div) {
      // ---------------
      // set variables 
      // ---------------
      this.mainClass = mainClass;
      this.c_width = canvasEL.width;
      this.c_height = canvasEL.height;
      this.canvasEL = canvasEL;

      this.canvas_div = canvas_div;
      /**
       * @type {HTMLDivElement[]}
       */
      this.div_table = []

      // ---------------------
      // set board parameters
      // ---------------------
      this.board = {
         x: 450,
         y: 50,
         width: 500,
         height: 500
      }

      // -------------
      // pawn list
      // -------------

      /**
       * @type {{
       *       red_player:Array<Pawn>|null,
       *       blue_player:Array<Pawn>|null,
       *       green_player:Array<Pawn>|null,
       *       yellow_player:Array<Pawn>|null,
       *    }
       * }
       */
      this.pawns_list = {};

      this.photo = document.createElement("img")
      this.photo.src = "./images/gameboard.png";
      this.ctx = canvasEL.getContext('2d')
      this.photo.onload = () => {
         this.updateCanvas();
      }
   }
   async updateCanvas() {
      // --------------
      // clear rect
      // --------------      
      this.ctx.clearRect(0, 0, this.c_width, this.c_height);

      // ------------------
      // background color
      // ------------------
      this.ctx.fillStyle = "#bba14c";
      this.ctx.fillRect(0, 0, this.c_width, this.c_height);

      await this.drawBoard();

      for (const key in this.pawns_list) {
         for (const el of this.pawns_list[key]) {
            this.drawPawn(key, el.sector, el.position)
         }
      }

      let out_field_counter = {}

      for (const key in this.pawns_list) {
         for (const el of this.pawns_list[key]) {
            if (el.sector == "outerFieldsPos") {
               if (out_field_counter[el.position] == null) out_field_counter[el.position] = 0;
               out_field_counter[el.position]++
            }
         }
      }

      for (const key in out_field_counter) {
         if (out_field_counter[key] > 1) {
            this.ctx.font = `14px Comic Sans MS`;
            this.ctx.fillStyle = "white";
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 2;

            this.ctx.textBaseline = 'middle';
            this.ctx.textAlign = "center";

            let { x, y } = getPos(this.board, "blue_player", "outerFieldsPos", key)
            this.ctx.strokeText(out_field_counter[key], x, y + 1);
            this.ctx.fillText(out_field_counter[key], x, y + 1);
         }
      }
   }
   drawBoard() {
      return new Promise((resolve, reject) => {
         this.ctx.drawImage(this.photo, this.board.x, this.board.y, this.board.width, this.board.height)
         resolve(true);

      })
   }

   // ----------
   // pawns
   // ----------
   /**
    * @typedef {"spawnFieldsPos"|"outerFieldsPos"|"innerFieldsPos"} sectors
    */

   /**
    * @typedef {"red_player"|"blue_player"|"green_player"|"yellow_player"} colors
    */

   /**
    * @typedef {{
    *    "pawns":Array<{
    *       "sector":sectors,
    *       "position":Number
    *     }>}|null} player
    */
   /**
    * @typedef {{
    *    "whose_turn":colors,
    *    "start_round_time":Number,
    *    "count_roll_dice":Number|null,
    *    "players":{
    *       red_player: player,
    *       blue_player: player,
    *       green_player: player,
    *       yellow_player: player,
    *    }
    * }} check_status_while_play
    */

   /**
    * 
    * @param {check_status_while_play} data 
    */
   checkPawnsPos(data) {
      let pawn_bool = true;

      let pawn_list_keys = Object.keys(this.pawns_list);

      if (pawn_list_keys.length != 0) {
         for (const key in data.players) {
            data.players[key].pawns.forEach((el, ind, arr) => {
               if (
                  this.pawns_list[key][ind].sector != el.sector ||
                  this.pawns_list[key][ind].position != el.position
               ) {
                  pawn_bool = false;
               }
            })
         }
      }
      else {
         pawn_bool = false;
      }

      return pawn_bool
   }

   /**
     * 
     * @param {check_status_while_play} data 
     */
   addAllPawns(data) {
      // ------------
      // add Pawns
      // ------------
      this.clearPawns();
      for (const key in data.players) {
         data.players[key].pawns.forEach((el, ind, arr) => {
            this.addPawn(key, el.sector, el.position, ind)
         })
      }
      this.updateCanvas();
   }

   clearPawns() {
      this.pawns_list = {}
   }

   addPawn(color, sector, position, ind) {
      // ------------
      // add Pawn
      // ------------
      if (this.pawns_list[color] == null) this.pawns_list[color] = []

      this.pawns_list[color][ind] = new Pawn(sector, position);
   }
   drawPawn(color, sector, position) {

      // --------------------
      // set properties
      // --------------------
      this.ctx.fillStyle = colorEvailable[color];
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      let Pawn = {
         ...getPos(this.board, color, sector, position),
         radius: 10,
      }

      // ----------
      // drawing
      // ----------
      this.ctx.arc(Pawn.x, Pawn.y, Pawn.radius, 0, 2 * Math.PI);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
   }

   // -----------------
   // click listeners 
   // -----------------

   /**
    * 
    * @param {colors} color 
    * @param {Number} diceNumber     
    */
   movePawnsListener(diceNumber, color = this.mainClass.userData.selectedColor) {
      return new Promise((resolve) => {
         // --------------------
         // check posible moves
         // --------------------
         let any_posible_pawns = false;

         this.pawns_list[color].forEach((el, ind, _arr) => {
            if ((diceNumber == 1 || diceNumber == 6) || el.sector != "spawnFieldsPos") {
               // ----------------------------------
               // check if pawn is possible to move
               // ----------------------------------
               /**
                * @type {{sector:sectors, position: colors}|undefined}
                */
               let field_o = undefined;
               if (el.sector == "spawnFieldsPos") {
                  field_o = {
                     sector: "outerFieldsPos",
                     position: importantFields[color]["start_point"],
                  };
               }
               else if (el.sector == "outerFieldsPos") {
                  if (el.position + diceNumber <= importantFields[color]["end_point"]
                     || el.position > importantFields[color]["end_point"]
                  ) {
                     field_o = {
                        sector: "outerFieldsPos",
                        position: el.position + diceNumber,
                     };
                  }
                  else {
                     field_o = {
                        sector: "innerFieldsPos",
                        position: diceNumber - (importantFields[color]["end_point"] - el.position) - 1,
                     };

                     if (field_o.position > 3) {
                        field_o = undefined;
                     }
                     else {
                        for (const iterator of this.pawns_list[color].filter(el1 => el1.sector == "innerFieldsPos")) {
                           if (field_o.position == iterator.position) {
                              field_o = undefined;
                              break
                           }
                        }
                     }
                  }
               }
               else {
                  field_o = {
                     sector: "innerFieldsPos",
                     position: el.position + diceNumber,
                  };


                  if (field_o.position > 3) {
                     field_o = undefined;
                  }
                  else {
                     for (const iterator of this.pawns_list[color].filter(el1 => el1.sector == "innerFieldsPos")) {
                        if (field_o.position == iterator.position) {
                           field_o = undefined;
                           break
                        }
                     }
                  }
               }

               if (field_o != undefined) {
                  any_posible_pawns = true

                  // --------
                  // pawn
                  // --------
                  let pawn = getPos(this.board, color, el.sector, el.position)

                  let div_pawn = document.createElement("div");
                  div_pawn.classList.add("pawn-div", "blink", color)

                  div_pawn.style.left = `${pawn.x}px`;
                  div_pawn.style.top = `${pawn.y}px`;

                  this.canvas_div.appendChild(div_pawn);

                  this.div_table.push(div_pawn);

                  let pawn1 = getPos(this.board, color, field_o.sector, field_o.position)

                  // ----------------------------
                  // display pos on mouse over
                  // ----------------------------
                  let mouse_over_block = document.createElement("div");
                  mouse_over_block.classList.add("mouseover-pawn");

                  mouse_over_block.style.left = `${pawn1.x}px`;
                  mouse_over_block.style.top = `${pawn1.y}px`;

                  this.div_table.push(mouse_over_block);

                  // ----------------
                  // event listeners
                  // ----------------
                  div_pawn.onmouseover = () => {
                     this.canvas_div.appendChild(mouse_over_block);
                  }
                  div_pawn.onmouseout = () => {
                     mouse_over_block.remove();
                  }
                  div_pawn.onclick = () => {
                     this.delete_div_pawns();
                     resolve(ind)
                  }
               }

            }
         });

         if (!any_posible_pawns) {
            resolve(-1);
         }
      })
   }

   delete_div_pawns() {
      this.div_table.forEach(el => {
         el.remove();
      })
      this.div_table = [];
   }
}