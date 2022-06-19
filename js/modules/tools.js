import { FieldsPos } from './constants.js'





/**
 * 
 * @param {*} src 
 * @returns {Promise<HTMLDivElement>}
 */
export async function importHTMLFile(src) {
   const response = await fetch(src);
   const html = await response.text();

   // @ts-ignore
   return new DOMParser().parseFromString(html, 'text/html').body.querySelector('div');
}







/**
 * @typedef {"spawnFieldsPos"|"outerFieldsPos"|"innerFieldsPos"} sectors
 */

/**
 * @typedef {"red_player"|"blue_player"|"green_player"|"yellow_player"} colors
 */

/**
 * 
 * @param {{x:Number,y:Number,width:Number,height:Number}} board 
 * @param {colors} color 
 * @param {sectors} sector 
 * @param {Number} position 
 * @returns 
 */
export function getPos({ x, y, width, height }, color, sector, position) {
   let cords = (sector == "spawnFieldsPos" || sector == "innerFieldsPos")
      ? FieldsPos[sector][color][position % FieldsPos[sector][color].length]
      : FieldsPos[sector][position % FieldsPos[sector].length]

   return {
      x: x + width * cords.x,
      y: y + height * cords.y,
   }
}







export function preloader() {
   let fetch_table = [
      "./templates/dice_3d.html",
      "./templates/endGame.html",
      "./templates/exit_window.html",
      "./templates/gameContainer.html",
      "./templates/inputName.html",
      "./templates/room.html",

      "./images/gameboard.png",
      "./images/dice/1.png",
      "./images/dice/2.png",
      "./images/dice/3.png",
      "./images/dice/4.png",
      "./images/dice/5.png",
      "./images/dice/6.png",
   ]

   fetch_table.forEach(el => {
      fetch(el);
   })
}







/**
 * 
 * @param {Number} time 
 */
export function use_sleep(time) {
   return new Promise(resolve => setTimeout(() => { resolve(true) }, time))
}