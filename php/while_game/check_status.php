<?php
session_start();
include("../tools/functions.php");
include("../tools/chinczyk_config.php");
include("../tools/check_room_status.php");
include("../tools/while_play_const.php");




$color_types_before = array("red_player", "blue_player", "green_player", "yellow_player");

$color_types =  my_filter($color_types_before, function ($el) {
   global $room_table;

   return $room_table[$el] != null;
});


$req_array = array();

$data_array;


$change_in_array = false;


if (count($color_types) == 1  && $room_table != null) {

   $color = $_SESSION["selected_color"];
   $id = $room_table["id"];

   $player_id = $_SESSION["player_id"];

   mysqli_query($data_base, "UPDATE rooms SET $color=NULL WHERE id=$id");
   mysqli_query($data_base, "DELETE FROM players WHERE id=$player_id");

   if ($room_table["data"] != null) {
      $data_array = json_decode($room_table["data"], true);


      $new_data = array();
      foreach ($data_array["players"] as $key => $value) {
         if ($key != $_SESSION["selected_color"]) {
            $new_data[$key] = $value;
         }
      }
      $data_array["players"] = $new_data;



      $json_data_array = json_encode($data_array, JSON_UNESCAPED_UNICODE);

      mysqli_query($data_base, "UPDATE rooms SET data='$json_data_array' WHERE id=$id");
   }

   session_destroy();
} else {
   // -----------------
   // send sync_time
   // -----------------
   $player_id = $_SESSION["player_id"];
   $sync_time = microtime_float();
   mysqli_query($data_base, "UPDATE players SET last_sync=$sync_time WHERE id=$player_id");




   // -----------------
   // check status
   // -----------------
   if ($room_table["data"] == "") {
      // ----------------
      // game beginning
      // ----------------
      $change_in_array = true;


      $data_array = array(
         "whose_turn" => $color_types[0],
         "start_round_time" => microtime_float(),
         "count_roll_dice" => null,
         "last_roll" => array(
            "player" => null,
            "count_roll_dice" => null
         ),
         "players" => array(),
      );

      foreach ($color_types as $key => $value) {

         $player_before = array_filter($players_table, function ($el) {
            global $room_table;
            global $value;
            return $el["id"] == $room_table[$value];
         });

         $data_array["players"][$value] = array(
            "name" => rawurlencode(array_shift($player_before)["name"]),
            "pawns" => array(),
         );

         for ($i = 0; $i < 4; $i++) {
            $data_array["players"][$value]["pawns"][$i] = array(
               "sector" => "spawnFieldsPos",
               "position" => $i,
            );
         }
      }
   } else {
      $data_array = json_decode($room_table["data"], true);

      $bool_end = false;
      include("./check_for_winner.php");

      if (
         !$bool_end
         && (microtime_float() - $data_array["start_round_time"] > $end_time
            || $data_array["players"][$data_array["whose_turn"]] == null)
      ) {
         // -------------------
         // on delta time > 60s
         // -------------------      
         $change_in_array = true;



         $index = array_search($data_array["whose_turn"], $color_types);
         $whose_turn = null;

         if ($index == count($color_types) - 1) {
            $whose_turn = $color_types[0];
         } else {
            $whose_turn = $color_types[$index + 1];
         }

         if ($data_array["count_roll_dice"] != null) {
            $data_array["last_roll"]["count_roll_dice"] = $data_array["count_roll_dice"];
         }

         $data_array["whose_turn"] = $whose_turn;
         $data_array["start_round_time"] = microtime_float();
         $data_array["count_roll_dice"] = null;
      }
   }

   $req_array["end_time"] = $end_time;
   $req_array["server_time"] = microtime_float();
   $req_array["game_phase"] = $room_table["game_phase"];
   $req_array["whose_turn"] = $data_array["whose_turn"];
   $req_array["start_round_time"] = $data_array["start_round_time"];
   $req_array["count_roll_dice"] = $data_array["count_roll_dice"];
   $req_array["last_roll"] = $data_array["last_roll"];
   $req_array["players"] = $data_array["players"];

   $json_data_array = json_encode($data_array, JSON_UNESCAPED_UNICODE);

   // -------------------
   // update database
   // -------------------
   if ($change_in_array) {
      $stmt = mysqli_prepare($data_base, "UPDATE rooms SET data=? WHERE id=?");
      mysqli_stmt_bind_param($stmt, "si", $json_data_array, $room_table["id"]);
      mysqli_stmt_execute($stmt);
   }


   // -----------------
   // check_players
   // -----------------

   include("../check_players.php");

   // --------------------
   // send info to client
   // --------------------
   echo json_encode($req_array, JSON_UNESCAPED_UNICODE);
}
