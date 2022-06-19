export default class Pawn {
   /**
    * 
    * @param {"spawnFieldsPos"|"outerFieldsPos"|"innerFieldsPos"} sector 
    * @param {Number} position 
    */
   constructor(sector, position) {
      this.sector = sector;
      this.position = position;
   }
}