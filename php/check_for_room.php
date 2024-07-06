<?php
session_start();
include("./tools/functions.php");


// ---------------------------
// get functions and json
// --------------------------   
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (
   (@$_SESSION["player_id"] == null
      || @$_SESSION["player_name"] == null
      || @$_SESSION["selected_color"] == null)
   && $data["name"] != ""
   && $data["name"] != null
) {


   // ------------------------
   // get DataBase and tables
   // ------------------------
   include("./tools/chinczyk_config.php");

   $rooms_table = get_data($data_base, "rooms");
   $players_table = get_data($data_base, "players");

   // ------------------------
   // insert into players
   // ------------------------

   $input_name = mb_substr(rawurldecode($data["name"]), 0, 13, 'UTF-8');
   $color_types = array("red_player", "blue_player", "green_player", "yellow_player");
   $sync_time = microtime_float();

   $stmt = mysqli_prepare($data_base, "INSERT into players(name, last_sync) values(?, ?)");
   mysqli_stmt_bind_param($stmt, "si", $input_name, $sync_time);
   mysqli_stmt_execute($stmt);

   if (mysqli_stmt_errno($stmt)) {
      echo "Błąd podczas wykonywania zapytania: " . mysqli_stmt_error($stmt);
   }

   $last_id = $data_base->insert_id;

   $selected_color = null;

   // ---------------------
   // check for free rooms
   // ---------------------

   if (count($rooms_table) != 0) {
      $room_found = false;

      for ($x = 0; $x < count($rooms_table); $x++) {
         if ($rooms_table[$x]["game_phase"] != 1) continue;



         $available_colors = array();

         foreach ($color_types as &$element) {
            if ($rooms_table[$x][$element] == null) {
               array_push($available_colors, $element);
            }
         }

         if (count($available_colors) != 0) {
            $room_found = true;

            $selected_color = $available_colors[rand(0, count($available_colors) - 1)];

            $stmt = mysqli_prepare($data_base, "UPDATE rooms SET " . $selected_color . " = ? WHERE id = " . $rooms_table[$x]['id']);
            mysqli_stmt_bind_param($stmt, "i", $last_id);
            mysqli_stmt_execute($stmt);

            break;
         };
      }

      if ($room_found == false) createNewRoom();
   } else createNewRoom();

   $_SESSION["player_id"] = $last_id;
   $_SESSION["player_name"] = $input_name;
   $_SESSION["selected_color"] = $selected_color;

   echo json_encode(array(
      "selectedColor" => $selected_color,
      "player_name" => $input_name
   ), JSON_UNESCAPED_UNICODE);
}


function createNewRoom()
{
   global $data_base;
   global $last_id;
   global $color_types;
   global $selected_color;

   $start_time = microtime_float();

   $selected_color = $color_types[rand(0, count($color_types) - 1)];

   $stmt1 = mysqli_prepare($data_base, "INSERT INTO rooms (" . $selected_color . ", game_phase, start_time) VALUES (?, 1, ?)");
   mysqli_stmt_bind_param($stmt1, "ii", $last_id, $start_time);
   mysqli_stmt_execute($stmt1);

   if (mysqli_stmt_errno($stmt1)) {
      echo "Błąd podczas wykonywania zapytania: " . mysqli_stmt_error($stmt1);
   }
}
