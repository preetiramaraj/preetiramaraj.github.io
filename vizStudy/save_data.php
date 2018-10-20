<?php
$data = $_POST['imgname'];
$hell = $_POST['imghell'];
$who = exec('whoami');
echo "hello";
$myfile = fopen("../../temp/newfile7.txt", "w") or die("Unable to open file!");
// $txt = "John Doe\n";
// fwrite($myfile, $txt);
// $txt = "Jane Doe\n";
fwrite($myfile, $who);
fwrite($myfile, $data);
fwrite($myfile, $hell);
fclose($myfile);
?>