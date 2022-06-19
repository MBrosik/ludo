<?php

$check_time = microtime_float() - (1 * 60 * 1000);

foreach ($players_table as $key => $value) {

   if ($value["last_sync"] < $check_time) {
      $color_types = array("red_player", "blue_player", "green_player", "yellow_player");
      $player_id = $value["id"];




      // -----------------------
      // building bool string
      // -----------------------
      $build_string = "(";

      foreach ($color_types as $key => $color) {
         $build_string .= " $color=$player_id ";

         if ($key != count($color_types) - 1) {
            $build_string .= "OR";
         }
      }

      $build_string .= ")";




      // ----------------------------
      // delete player from database
      // ----------------------------

      $result = mysqli_query($data_base, "SELECT * FROM rooms WHERE ($build_string)");
      $rooms_table_before = mysqli_fetch_all($result, MYSQLI_ASSOC);

      if (count($rooms_table_before) != 0) {
         $room_table = array_shift($rooms_table_before);

         $selected_color = null;

         foreach ($color_types as $key => $color) {
            if ($room_table[$color] == $player_id) {
               $selected_color = $color;
               break;
            }
         }

         delete_player($data_base, $room_table, $selected_color, $room_table["id"], $player_id);
      } else {
         mysqli_query($data_base, "DELETE FROM players WHERE id=$player_id");
      }
   }
}
