<?php
session_start();
include("../tools/functions.php");
include("../tools/chinczyk_config.php");
include("../tools/check_room_status.php");

include("../tools/while_play_const.php");

$req_array = array();

// ------------
// post
// ------------
$json = file_get_contents('php://input');
$json_parsed = json_decode($json, true);




// ----------------------
// "data" from database
// ----------------------
$data_array = json_decode($room_table["data"], true);

$temp1 = $json_parsed["pawn_id"] != null
   && $data_array["whose_turn"] == $_SESSION["selected_color"]
   && $data_array["count_roll_dice"] != null;




// --------------
// move pawn
// --------------
if (is_numeric($json_parsed["pawn_id"])) {


   $json_parsed["pawn_id"] = intval($json_parsed["pawn_id"]);


   if (
      $json_parsed["pawn_id"] != -1
      && $json_parsed["pawn_id"] >= 0
      && $json_parsed["pawn_id"] <= 3
      && $data_array["whose_turn"] == $_SESSION["selected_color"]
      && $data_array["count_roll_dice"] != null
      && microtime_float() - $data_array["start_round_time"] < $end_time
   ) {

      $pawn = $data_array["players"][$_SESSION["selected_color"]]["pawns"][$json_parsed["pawn_id"]];
      $pre_field = json_decode(json_encode($pawn, JSON_UNESCAPED_UNICODE), true);

      if (($data_array["count_roll_dice"] == 1 || $data_array["count_roll_dice"] == 6) || $pawn["sector"] != "spawnFieldsPos") {
         // ----------------------------------
         // check if pawn is possible to move
         // ----------------------------------      

         if ($pawn["sector"] == "spawnFieldsPos") {
            // ---------------------
            // if pawn is on spawn
            // ---------------------
            $pawn["sector"] = "outerFieldsPos";
            $pawn["position"] = $important_fields[$_SESSION["selected_color"]]["start_point"];
         } else if ($pawn["sector"] == "outerFieldsPos") {
            // --------------------------
            // if pawn is in outerField
            // --------------------------
            if (
               $pawn["position"] + $data_array["count_roll_dice"]
               <= $important_fields[$_SESSION["selected_color"]]["end_point"]
               || $pawn["position"] > $important_fields[$_SESSION["selected_color"]]["end_point"]
            ) {
               // -------------------------------------
               // if pawn next pos == "outerFieldsPos"
               // ------------------------------------- 
               $pawn["sector"] = "outerFieldsPos";
               $pawn["position"] = ($pawn["position"] + $data_array["count_roll_dice"]) % 40;
            } else {
               // -------------------------------------
               // if pawn next pos == "innerFieldsPos"
               // -------------------------------------
               $next_pos = $data_array["count_roll_dice"] - ($important_fields[$_SESSION["selected_color"]]["end_point"] - $pawn["position"]) - 1;

               if ($next_pos <= 3) {
                  // -------------------------------------
                  // check possible pos in "innerFieldsPos"
                  // -------------------------------------
                  $pawns = my_filter($data_array["players"][$_SESSION["selected_color"]]["pawns"], function ($el) {
                     return $el["sector"] == "innerFieldsPos";
                  });

                  $move_bool = true;
                  foreach ($pawns as $key => $value) {
                     if ($value["position"] == $next_pos) {
                        $move_bool = false;
                     }
                  }

                  if ($move_bool) {
                     $pawn["sector"] = "innerFieldsPos";
                     $pawn["position"] = $next_pos;
                  }
               }
            }
         } else {
            // --------------------------
            // if pawn is in innerField
            // --------------------------

            $next_pos = $pawn["position"] + $data_array["count_roll_dice"];

            if ($next_pos <= 3) {
               // -------------------------------------
               // check possible pos in "innerFieldsPos"
               // -------------------------------------
               $pawns = my_filter($data_array["players"][$_SESSION["selected_color"]]["pawns"], function ($el) {
                  return $el["sector"] == "innerFieldsPos";
               });

               $move_bool = true;
               foreach ($pawns as $key => $value) {
                  if ($value["position"] == $next_pos) {
                     $move_bool = false;
                  }
               }

               if ($move_bool) {
                  $pawn["sector"] = "innerFieldsPos";
                  $pawn["position"] = $next_pos;
               }
            }
         }

         $data_array["players"][$_SESSION["selected_color"]]["pawns"][$json_parsed["pawn_id"]] = $pawn;

         // ------------------
         // killer
         // ------------------
         $pos_bool = $pawn["position"] != $pre_field["position"];
         $sector_bool = $pawn["sector"] != $pre_field["sector"];

         if (($pos_bool || $sector_bool) && $pawn["sector"] != "innerFieldsPos") {
            foreach ($data_array["players"] as $color_key => $color_value) {
               foreach ($color_value["pawns"] as $for_id => $for_pawn) {
                  if (
                     $color_key != $_SESSION["selected_color"]
                     && $for_pawn["sector"] == $pawn["sector"]
                     && $for_pawn["position"] == $pawn["position"]
                  ) {
                     $data_array["players"][$color_key]["pawns"][$for_id]["sector"] = "spawnFieldsPos";
                     $data_array["players"][$color_key]["pawns"][$for_id]["position"] = $for_id;
                  }
               }
            }
         }
      }
   }
}

if (
   $data_array["whose_turn"] == $_SESSION["selected_color"]
) {

   // ---------------------
   // color type array
   // ---------------------
   $color_types_before = array("red_player", "blue_player", "green_player", "yellow_player");
   $color_types =  my_filter($color_types_before, function ($el) {
      global $room_table;

      return $room_table[$el] != null;
   });

   // ----------------
   // change tour
   // ----------------
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

   // -------------------
   // search for winner
   // -------------------   
   include("./check_for_winner.php");


   $json_data_array = json_encode($data_array, JSON_UNESCAPED_UNICODE);
   $id = $room_table["id"];

   $stmt1 = mysqli_prepare($data_base, "UPDATE rooms SET data=? WHERE id=?");
   mysqli_stmt_bind_param($stmt1, "si", $json_data_array, $id);
   mysqli_stmt_execute($stmt1);


   // ---------------
   // send data
   // ---------------

   $req_array["server_time"] = microtime_float();
   $req_array["game_phase"] = $room_table["game_phase"];
   $req_array["whose_turn"] = $data_array["whose_turn"];
   $req_array["start_round_time"] = $data_array["start_round_time"];
   $req_array["count_roll_dice"] = $data_array["count_roll_dice"];
   $req_array["last_roll"] = $data_array["last_roll"];
   $req_array["players"] = $data_array["players"];

   echo json_encode($req_array, JSON_UNESCAPED_UNICODE);
} else {
   echo "Cheater!";
}
