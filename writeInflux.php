<?php
require 'vendor/autoload.php';

use InfluxDB2\Client;
use InfluxDB2\Point;
use InfluxDB2\Model\WritePrecision;

function writeToInfluxDB($level, $startTime = null) {
    // Read InfluxDB configuration from config.json
    $config = json_decode(file_get_contents('config.json'), true);
    $influxDBConfig = $config['InfluxDB'];

    // Read patient's preferred name from patient.json
    $patient = json_decode(file_get_contents('patient.json'), true);
    $preferredName = $patient['prefName'] ?? 'unknown_user';

    // Define database and retention policy
    $database = $influxDBConfig['Database'];
    $retentionPolicy = 'autogen'; // Default retention policy, adjust if different
    $bucket = "$database/$retentionPolicy";

    // Create an InfluxDB client instance using forward compatibility APIs
    $client = new Client([
        "url" => "http://{$influxDBConfig['Host']}:{$influxDBConfig['Port']}",
        "token" => "{$influxDBConfig['User']}:{$influxDBConfig['Pass']}",
        "bucket" => $bucket,
        "org" => "-",
        "precision" => WritePrecision::S
    ]);

    // If startTime is not provided, use current time
    if ($startTime === null) {
        $startTime = microtime(true);
    }

    // Prepare data point
    $point = Point::measurement('pain_log')
        ->addTag('user', $preferredName)
        ->addField('level', $level)
        ->time($startTime);

    // Write the point to the database
    try {
        $writeApi = $client->createWriteApi();
        $writeApi->write($point);
        $writeApi->close();
        $result = true;
    } catch (Exception $e) {
        // Handle exception
        $result = false;
    }

    return $result; // Returns true on success, false on failure
}

// Example usage
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $level = $_POST['painLevel'] ?? null;
    $startTime = $_POST['startTime'] ?? null;
    if ($level !== null) {
        $result = writeToInfluxDB($level, $startTime);
    // Handle $result to see if it was successful or not
    echo $result ? 'Success' : 'Failure';
}
}
?>
