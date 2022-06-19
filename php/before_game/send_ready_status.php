<?php
session_start();
include("../tools/functions.php");
$json = file_get_contents('php://input');
$data = (array) json_decode($json);

include("../tools/chinczyk_config.php");
$data_base = mysqli_connect($host, $user, $passwd, $dbname);

$stmt = mysqli_prepare($data_base, "UPDATE players SET ready_for_game=? WHERE id=?");
mysqli_stmt_bind_param($stmt, "ii", $data["ready_for_game"], $_SESSION["player_id"]);
mysqli_stmt_execute($stmt);
