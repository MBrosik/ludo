export const colorEvailable = {
   "red_player": "rgb(248, 69, 69)",
   "blue_player": "rgb(58, 58, 247)",
   "green_player": "green",
   "yellow_player": "yellow",
}

export const requestTime = 2000;

export const dice_3d_pos = {
   1: {
      x: 180,
      y: 0,
      z: 0
   },
   2: {
      x: -90,
      y: 0,
      z: 0
   },
   3: {
      x: 0,
      y: -90,
      z: 0
   },
   4: {
      x: 0,
      y: 90,
      z: 0
   },
   5: {
      x: 90,
      y: 0,
      z: 0
   },
   6: {
      x: 0,
      y: 0,
      z: 0
   },
}
// --------------
// Positions
// --------------

export const FieldsPos = {
   spawnFieldsPos: {
      red_player: [
         { x: 0.0659, y: 0.0649 },
         { x: 0.153, y: 0.0649 },
         { x: 0.0659, y: 0.152 },
         { x: 0.153, y: 0.152 },
      ],
      blue_player: [
         { x: 0.849, y: 0.0649 },
         { x: 0.93574, y: 0.0649 },
         { x: 0.849, y: 0.152 },
         { x: 0.93574, y: 0.152 },
      ],
      green_player: [
         { x: 0.849, y: 0.8487 },
         { x: 0.93574, y: 0.8487 },
         { x: 0.849, y: 0.9356 },
         { x: 0.93574, y: 0.9356 },
      ],
      yellow_player: [
         { x: 0.0659, y: 0.8487 },
         { x: 0.153, y: 0.8487 },
         { x: 0.0659, y: 0.9356 },
         { x: 0.153, y: 0.9356 },
      ]
   },
   outerFieldsPos: [
      // od czerwonego w prawo
      { x: 0.0659, y: 0.414 }, // startpoint czerwonego
      { x: 0.153, y: 0.414 },
      { x: 0.241, y: 0.414 },
      { x: 0.326, y: 0.414 },
      // w górę
      { x: 0.415, y: 0.414 }, // skrzyżowanie          
      { x: 0.415, y: 0.327 },
      { x: 0.415, y: 0.2395 },
      { x: 0.415, y: 0.152 },
      // w prawo
      { x: 0.415, y: 0.0649 }, // skrzyżowanie 
      { x: 0.50199, y: 0.0649 },

      // od niebieskiego w dół
      { x: 0.58898, y: 0.0649 }, // startpoint niebieskiego
      { x: 0.58898, y: 0.152 },
      { x: 0.58898, y: 0.2395 },
      { x: 0.58898, y: 0.327 },
      // w prawo
      { x: 0.58898, y: 0.413 }, // skrzyżowanie
      { x: 0.67597, y: 0.413 },
      { x: 0.76296, y: 0.413 },
      { x: 0.849, y: 0.413 },
      // w dół
      { x: 0.93574, y: 0.413 }, // skrzyżowanie
      { x: 0.93574, y: 0.5005 },

      // od zielonego w lewo
      { x: 0.93574, y: 0.588 }, // startpoint zielonego
      { x: 0.849, y: 0.588 },
      { x: 0.76296, y: 0.588 },
      { x: 0.67597, y: 0.588 },
      // w dół
      { x: 0.58798, y: 0.588 },  // skrzyżowanie
      { x: 0.58798, y: 0.6749 },
      { x: 0.58798, y: 0.7618 },
      { x: 0.58798, y: 0.8487 },
      // w lewo
      { x: 0.58798, y: 0.9356 }, // skrzyżowanie
      { x: 0.50199, y: 0.9356 },

      // od żółtego w górę
      { x: 0.414, y: 0.9356 }, // startpoint żółtego
      { x: 0.414, y: 0.8487 },
      { x: 0.414, y: 0.7618 },
      { x: 0.414, y: 0.6749 },
      // w lewo
      { x: 0.414, y: 0.588 },  // skrzyżowanie
      { x: 0.326, y: 0.588 },
      { x: 0.241, y: 0.588 },
      { x: 0.153, y: 0.588 },
      // w góre
      { x: 0.0659, y: 0.588 },
      { x: 0.0659, y: 0.5005 },
   ],

   innerFieldsPos: {
      red_player: [
         { x: 0.153, y: 0.5005 },
         { x: 0.241, y: 0.5005 },
         { x: 0.326, y: 0.5005 },
         { x: 0.414, y: 0.5005 },
      ],
      blue_player: [
         { x: 0.50199, y: 0.152 },
         { x: 0.50199, y: 0.2395 },
         { x: 0.50199, y: 0.327 },
         { x: 0.50199, y: 0.414 },
      ],
      green_player: [
         { x: 0.849, y: 0.5005 },
         { x: 0.76296, y: 0.5005 },
         { x: 0.67597, y: 0.5005 },
         { x: 0.58898, y: 0.5005 },
      ],
      yellow_player: [
         { x: 0.50199, y: 0.8487 },
         { x: 0.50199, y: 0.7618 },
         { x: 0.50199, y: 0.6749 },
         { x: 0.50199, y: 0.588 },
      ]
   }
}

export const importantFields = {
   red_player: {
      start_point: 0,
      end_point: 39
   },
   blue_player: {
      start_point: 10,
      end_point: 9
   },
   green_player: {
      start_point: 20,
      end_point: 19
   },
   yellow_player: {
      start_point: 30,
      end_point: 29
   }
}