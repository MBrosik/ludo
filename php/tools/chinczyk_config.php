<?php
// $host = "localhost";
// $user = "root";
// $passwd = "";
// $dbname = "ludo";


$host = "mysql";
$user = "admin";
$passwd = "admin";
$dbname = "ludo";

$data_base = mysqli_connect($host, $user, $passwd, $dbname);

if (!$data_base) {
   die("Connection failed: " . mysqli_connect_error());
}