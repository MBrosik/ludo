<?php

session_start();
include("../tools/functions.php");
include("../tools/chinczyk_config.php");



// ------------
// post
// ------------
$json = file_get_contents('php://input');
$json_parsed = json_decode($json, true);


if (
   (@$_SESSION["player_id"] == null
      || @$_SESSION["player_name"] == null
      || @$_SESSION["selected_color"] == null)
   && $json_parsed["name"] != ""
   && $json_parsed["name"] != null
) {


   $color_types = array("red_player", "blue_player", "green_player", "yellow_player");



   // ------------------------
   // get DataBase and tables
   // ------------------------
   $data_base = mysqli_connect($host, $user, $passwd, $dbname);
   $rooms_table = get_data($data_base, "rooms");
   $players_table = get_data($data_base, "players");


   $room_before = array_filter($rooms_table, function ($el) {
      global $json_parsed;
      return $el["id"] == $json_parsed["id"];
   });

   $room = array_shift($room_before);



   // ----------------------------
   // search for available colors
   // ----------------------------
   $available_colors = array();


   foreach ($color_types as $key => $element) {
      if ($room[$element] == null) {
         array_push($available_colors, $element);
      }
   }

   if ($room["game_phase"] == 1 && count($available_colors) != 0) {

      // ------------------------
      // insert into players
      // ------------------------


      $input_name = mb_substr(rawurldecode($json_parsed["name"]), 0, 13, 'UTF-8');
      $sync_time = microtime_float();

      $stmt = mysqli_prepare($data_base, "INSERT into players(name, last_sync) values(?, ?)");
      mysqli_stmt_bind_param($stmt, "si", $input_name, $sync_time);
      mysqli_stmt_execute($stmt);

      $last_id = $data_base->insert_id;



      // ---------------------------------
      // select color
      // ---------------------------------

      $selected_color = null;

      if (count($available_colors) != 0) {
         $room_found = true;

         $selected_color = $available_colors[rand(0, count($available_colors) - 1)];

         $stmt = mysqli_prepare($data_base, "UPDATE rooms SET " . $selected_color . " = ? WHERE id = " . $room['id']);
         mysqli_stmt_bind_param($stmt, "i", $last_id);
         mysqli_stmt_execute($stmt);
      };



      // --------------------
      // response to client
      // --------------------

      $_SESSION["player_id"] = $last_id;
      $_SESSION["player_name"] = $input_name;
      $_SESSION["selected_color"] = $selected_color;

      echo json_encode(array(
         "selectedColor" => $selected_color,
         "player_name" => $input_name,
         "room_found" => true,
      ), JSON_UNESCAPED_UNICODE);
   } else {
      echo json_encode(array(
         "room_found" => false,
      ), JSON_UNESCAPED_UNICODE);
   }
}
