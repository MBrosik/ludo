<?php
session_start();
include("./tools/functions.php");

if (isset($_SESSION["player_id"])) {
   include("./tools/chinczyk_config.php");
   include("./tools/check_room_status.php");

   if ($room_table != null) {
      $playerTab = array_filter($players_table, function ($k) {
         return $k["id"] == $_SESSION["player_id"];
      });

      $player = array_shift($playerTab);

      if ($room_table["game_phase"] != 3) {
         echo json_encode(array(
            "sessionExists" => true,
            "playerName" => $_SESSION["player_name"],
            "selectedColor" => $_SESSION["selected_color"],
            "game_phase" => $room_table["game_phase"],
            "userArray" => array(
               "ready_for_game" => $player["ready_for_game"]
            ),
         ), JSON_UNESCAPED_UNICODE);
      } else {
         $_SESSION["player_id"] = null;
         $_SESSION["player_name"] = null;
         $_SESSION["selected_color"] = null;

         echo json_encode(array("sessionExists" => false), JSON_UNESCAPED_UNICODE);
      }
   } else {
      $_SESSION["player_id"] = null;
      $_SESSION["player_name"] = null;
      $_SESSION["selected_color"] = null;

      echo json_encode(array("sessionExists" => false), JSON_UNESCAPED_UNICODE);
   }
} else {
   echo json_encode(array("sessionExists" => false), JSON_UNESCAPED_UNICODE);
}
