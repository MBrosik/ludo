<?php
// ------------------------
// get DataBase and tables
// ------------------------
$data_base = mysqli_connect($host, $user, $passwd, $dbname);
$room_table_array = array_filter(get_data($data_base, "rooms"), function ($k) {
   return $k[$_SESSION["selected_color"]] == $_SESSION["player_id"];
});
$room_table = array_shift($room_table_array);
$players_table = get_data($data_base, "players");
