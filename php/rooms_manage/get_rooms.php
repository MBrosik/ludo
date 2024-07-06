<?php
include("../tools/functions.php");
include("../tools/chinczyk_config.php");

$color_types = array("red_player", "blue_player", "green_player", "yellow_player");



// -----------------------
// building bool string
// -----------------------
$build_string = "(";
$build_string1 = "(";

foreach ($color_types as $key => $color) {
   $build_string .= " $color IS NOT NULL ";
   $build_string1 .= " $color IS NULL ";

   if ($key != count($color_types) - 1) {
      $build_string .= "OR";
      $build_string1 .= "AND";
   }
}

$build_string .= ")";
$build_string1 .= ")";





// ---------------------------
// get data from database
// ---------------------------

$players_table = get_data($data_base, "players");

$time_check = microtime_float() - (15 * 60 * 1000);
mysqli_query($data_base, "DELETE FROM rooms WHERE (game_phase=1 AND (start_time<$time_check OR $build_string1))");
mysqli_query($data_base, "DELETE FROM rooms WHERE (game_phase=2 AND $build_string1)");
mysqli_query($data_base, "DELETE FROM rooms WHERE (game_phase=3 AND end_time<$time_check)");

$result = mysqli_query($data_base, "SELECT * FROM rooms WHERE ($build_string AND game_phase=1)");
$rooms_table_before = mysqli_fetch_all($result, MYSQLI_ASSOC);



// --------------
// map array
// --------------
$k1 = null;
$value1 = null;

$map_func = function ($k) {
   global $color_types;
   global $players_table;
   global $k1;
   global $value1;

   $k1 = $k;

   $map_array = array();

   $map_array["id"] = $k["id"];

   foreach ($color_types as $key => $value) {
      $value1 = $value;

      if ($k[$value] != null) {

         $player_before = array_filter($players_table, function ($el) {
            global $k1;
            global $value1;

            return $el["id"] == $k1[$value1];
         });

         $player = array_shift($player_before);
         $map_array[$value] = $player["name"];
      } else {
         $map_array[$value] = "--------";
      }
   }

   return $map_array;
};




// ------------
// send data
// ------------

$rooms_table = array_map($map_func, $rooms_table_before);

$res_json = json_encode($rooms_table, JSON_UNESCAPED_UNICODE);

echo $res_json;
