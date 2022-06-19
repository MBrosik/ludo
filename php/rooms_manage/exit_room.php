<?php
session_start();

include("../tools/functions.php");
include("../tools/chinczyk_config.php");
include("../tools/check_room_status.php");


if ($room_table != null) {
   $color = $_SESSION["selected_color"];
   $room_id = $room_table["id"];

   $player_id = $_SESSION["player_id"];

   delete_player($data_base, $room_table, $color, $room_id, $player_id);

   $_SESSION["player_id"] = null;
   $_SESSION["player_name"] = null;
   $_SESSION["selected_color"] = null;
   session_destroy();
}
