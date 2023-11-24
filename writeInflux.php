<?php
require 'vendor/autoload.php';

use InfluxDB2\Client;
use InfluxDB2\Point;
use InfluxDB2\Model\WritePrecision;

function writeToInfluxDB($level) {
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
    $startTime = (microtime(true));

    // Prepare data point
    $point = Point::measurement('pain_log')
        ->addTag('user', $preferredName)
        ->addField('level', $level);

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
    error_log("POST Data: " . print_r($_POST, true)); // Debugging line
    $level = $_POST['painLevel'] ?? null;
    if ($level !== null) {
        $result = writeToInfluxDB($level);
    // Handle $result to see if it was successful or not
    echo $result ? 'Success' : 'Failure';
}
}
?>
