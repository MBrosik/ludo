<?php
if ($room_table["winner"] == null) {
   // ----------------------
   // check for the winner
   // ----------------------
   foreach ($data_array["players"] as $color_key => $color_value) {
      $bool_end_player = true;
      foreach ($color_value["pawns"] as $for_id => $for_pawn) {
         if ($for_pawn["sector"] != "innerFieldsPos") {
            $bool_end_player = false;
         }
      }
      if ($bool_end_player) {
         $bool_end = true;
         $winner_id = $room_table[$color_key];

         $id = $room_table["id"];

         $end_time = microtime_float();
         mysqli_query($data_base, "UPDATE rooms SET game_phase=3, winner=$winner_id, end_time=$end_time WHERE id=$id");

         $room_table["game_phase"] = 3;

         $playerTab = array_filter($players_table, function ($k) {
            global $winner_id;
            return $k["id"] == $winner_id;
         });

         $player = array_shift($playerTab);

         $req_array["winner"] = array(
            "color" => $color_key,
            "player" => $player["name"],
         );
         break;
      }
   }
} else {
   //--------------------
   // if winner exists
   //--------------------
   $bool_end = true;

   $winner_id = $room_table["winner"];
   $winner_color = null;

   foreach ($color_types as $player_id => $color) {
      if ($room_table[$color] == $winner_id) {
         $winner_color = $color;
         break;
      }
   }

   $playerTab = array_filter($players_table, function ($k) {
      global $winner_id;
      return $k["id"] == $winner_id;
   });

   $player = array_shift($playerTab);

   $req_array["winner"] = array(
      "color" => $winner_color,
      "player" => $player["name"],
   );
}
