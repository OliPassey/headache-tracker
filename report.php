<?php
require_once 'vendor/autoload.php';

use InfluxDB2\Client;
use InfluxDB2\Model\Query;

// Read configuration from config.json
$config = json_decode(file_get_contents('config.json'), true);

// Get InfluxDB configuration
$influxConfig = $config['InfluxDB'] ?? null;

if (!$influxConfig) {
    throw new Exception("InfluxDB configuration not found.");
}

// Set up the InfluxDB client for InfluxDB 1.8
$influxClient = new Client([
    "url" => "http://{$influxConfig['Host']}:{$influxConfig['Port']}",
    "username" => $influxConfig['User'],
    "password" => $influxConfig['Pass'],
    "database" => $influxConfig['Database']
]);

// Define the query for InfluxDB 1.8
$queryApi = $influxClient->createQueryApi();
$query = 'SELECT "level" FROM "autogen"."pain_log" WHERE "user" = \'Oli\' AND $timeFilter';
// Replace $timeFilter with actual time conditions, e.g., 'time > now() - 1d'

$result = $queryApi->query($query);

// Process and store data
$painData = [];
foreach ($result as $item) {
    $painData[] = [
        'time' => $item['time'], // Or whatever the time field is
        'level' => $item['level']
    ];
}




echo $painData;