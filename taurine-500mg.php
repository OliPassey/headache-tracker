<?php
//
// A very simple PHP cURL example to log my freakin pain
//
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL,"http://10.0.0.92:8086/write?db=telegraf");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS,
            "Headache.Tracker,Subject=Oli Supplement.500mg.Taurine=1");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$server_output = curl_exec($ch);
curl_close ($ch);
?>
