<?php
session_start();
include("../tools/functions.php");
include("../tools/chinczyk_config.php");
include("../tools/check_room_status.php");

include("../tools/while_play_const.php");

$data_array = json_decode($room_table["data"], true);




if ($_SESSION["selected_color"] == $data_array["whose_turn"] && $data_array["count_roll_dice"] == null) {
   $drawn_number = rand(1, 6);

   $data_array["count_roll_dice"] = $drawn_number;
   $data_array["last_roll"]["player"] = $data_array["whose_turn"];

   //----------------------------------------------------------------------
   //----------------------------------------------------------------------
   //----------------------------------------------------------------------
   //----------------------------------------------------------------------
   //----------------------------------------------------------------------
   //----------------------------------------------------------------------



   // ----------------------------------
   // check if pawn is possible to move
   // ----------------------------------

   $pawns_list = $data_array["players"][$_SESSION["selected_color"]]["pawns"];

   $possible_move_bool = false;


   foreach ($pawns_list as $key => $pawn) {
      if (
         $data_array["count_roll_dice"] == 1
         || $data_array["count_roll_dice"] == 6
         || $pawn["sector"] != "spawnFieldsPos"
      ) {
         if ($pawn["sector"] == "spawnFieldsPos") {
            // ---------------------
            // if pawn is on spawn
            // ---------------------
            $possible_move_bool = true;
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
               $possible_move_bool = true;
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
                     $possible_move_bool = true;
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
                  $possible_move_bool = true;
               }
            }
         }
      }

      if ($possible_move_bool) break;
   }

   //----------------------------------------------------------------------   
   //----------------------------------------------------------------------   
   //----------------------------------------------------------------------   
   //----------------------------------------------------------------------   
   //----------------------------------------------------------------------   
   //---------------------------------------------------------------------- 


   if (!$possible_move_bool) {
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

      $data_array["last_roll"]["player"] = $data_array["whose_turn"];
      if ($data_array["count_roll_dice"] != null) {
         $data_array["last_roll"]["count_roll_dice"] = $data_array["count_roll_dice"];
      }

      $data_array["whose_turn"] = $whose_turn;
      $data_array["start_round_time"] = microtime_float();
      $data_array["count_roll_dice"] = null;
   }



   $json_data_array = json_encode($data_array, JSON_UNESCAPED_UNICODE);
   $id = $room_table["id"];


   $stmt1 = mysqli_prepare($data_base, "UPDATE rooms SET data=? WHERE id=?");
   mysqli_stmt_bind_param($stmt1, "si", $json_data_array, $id);
   mysqli_stmt_execute($stmt1);




   $temp1_stmt =  mysqli_query($data_base, "SELECT * FROM rooms WHERE id=$id");

   $temp1_before = mysqli_fetch_all($temp1_stmt, MYSQLI_ASSOC);
   $temp1 = array_shift($temp1_before);
   $temp1_data = json_decode($temp1['data'], true);





   echo json_encode(array(
      "count_roll_dice" => $data_array["count_roll_dice"],
      "whose_turn" => $data_array["whose_turn"],
      "last_roll" => $data_array["last_roll"]
   ), JSON_UNESCAPED_UNICODE);
} else {
   echo "No cheating please! :)";
}
