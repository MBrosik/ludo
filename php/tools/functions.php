<?php
function get_data($dataBase, $table, $key = null, $value = null)
{
   $result = null;
   $arr = null;

   if ($key == null || $value == null) {
      $result = mysqli_query($dataBase, "SELECT * FROM " . $table);
      $arr = mysqli_fetch_all($result, MYSQLI_ASSOC);
   } else {
      $result = mysqli_query($dataBase, "SELECT * FROM " . $table . " WHERE '" . $key . "'='" . $value . "'");
      $arr = mysqli_fetch_all($result, MYSQLI_ASSOC);
   }

   return $arr;
}

function my_filter($old_array, $callback)
{
   $newArray = array();
   foreach ($old_array as $value) {
      if ($callback($value)) {
         array_push($newArray, $value);
      }
   }
   return $newArray;
}

function logger($log, $dest = "log.log")
{
   if (!file_exists($dest)) {
      file_put_contents($dest, "");
   }

   $time = date("d.m.y h:i:s A", time());

   $current_content = file_get_contents($dest);
   $current_content .= "$time\t\t\t$log\r";
   file_put_contents($dest, $current_content);
}

function microtime_float()
{
   list($usec, $sec) = explode(" ", microtime());
   return ((float)$usec + (float)$sec) * 1000;
}



function delete_player($data_base, $room_table, $color, $room_id, $player_id)
{


   mysqli_query($data_base, "UPDATE rooms SET $color=NULL WHERE id=$room_id");
   mysqli_query($data_base, "DELETE FROM players WHERE id=$player_id");



   if ($room_table["data"] != null) {
      $data_array = json_decode($room_table["data"], true);


      $new_data = array();
      foreach ($data_array["players"] as $key => $value) {
         if ($key != $color) {
            $new_data[$key] = $value;
         }
      }
      $data_array["players"] = $new_data;



      $json_data_array = json_encode($data_array, JSON_UNESCAPED_UNICODE);

      mysqli_query($data_base, "UPDATE rooms SET data='$json_data_array' WHERE id=$room_id");
   }
}
