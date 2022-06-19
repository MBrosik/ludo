<?php
session_start();
include("../tools/functions.php");
include("../tools/chinczyk_config.php");
include("../tools/check_room_status.php");

if ($room_table["game_phase"] != 3) {
   // -----------------
   // send sync_time
   // -----------------
   $player_id = $_SESSION["player_id"];
   $sync_time = microtime_float();

   $stmt = mysqli_prepare($data_base, "UPDATE players SET last_sync=? WHERE id=?");
   mysqli_stmt_bind_param($stmt, "ii", $sync_time, $player_id);
   mysqli_stmt_execute($stmt);



   // -----------------
   // check_players
   // -----------------

   include("../check_players.php");




   // -----------------
   // check status
   // -----------------
   $color_types = array("red_player", "blue_player", "green_player", "yellow_player");

   $req_arr = array(
      "players" => array()
   );
   $all_players_in_game = true;
   $all_ready_for_game = true;

   $num_of_players = 0;

   foreach ($color_types as $key => $value) {
      if ($room_table[$value] == "") {
         $req_arr["players"][$value] = null;
         $all_players_in_game = false;
      } else {
         $num_of_players++;
         $playerTab = array_filter($players_table, function ($k) {
            global $value;
            global $room_table;

            if ($room_table[$value] != null) {
               return $k["id"] == $room_table[$value];
            } else {
               return false;
            }
         });

         $player = array_shift($playerTab);

         if ($player["ready_for_game"] == 0) $all_ready_for_game = false;

         $req_arr["players"][$value] = array(
            "name" => $player["name"],
            "ready_for_game" => $player["ready_for_game"]
         );
      }
   }

   if ($room_table["game_phase"] != 2) {
      if (($all_players_in_game || $all_ready_for_game) && $num_of_players > 1) {
         $stmt = mysqli_prepare($data_base, "UPDATE rooms SET game_phase = 2 WHERE id=?");
         mysqli_stmt_bind_param($stmt, "i", $room_table["id"]);
         mysqli_stmt_execute($stmt);

         $req_arr["game_phase"] = 2;
      } else {
         $req_arr["game_phase"] = 1;
      }
   } else {
      $req_arr["game_phase"] = 2;
   }

   echo json_encode($req_arr, JSON_UNESCAPED_UNICODE);
}
