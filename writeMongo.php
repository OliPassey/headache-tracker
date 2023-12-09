<?php
require_once 'vendor/autoload.php';

function getMongoDBConfig() {
    $config = json_decode(file_get_contents('conf/config.json'), true);
    return $config['MongoDB'] ?? null;
}

function getMongoDBClient() {
    $mongoConfig = getMongoDBConfig();
    if (!$mongoConfig) {
        throw new Exception("MongoDB configuration not found.");
    }

    $client = new MongoDB\Client("mongodb://{$mongoConfig['IP']}:{$mongoConfig['Port']}");
    return $client->selectDatabase($mongoConfig['Database']);
}

function writeToMongoDB($data) {
    $db = getMongoDBClient();
    $mongoConfig = getMongoDBConfig();
    $collection = $db->selectCollection($mongoConfig['Collection']);
    $result = $collection->insertOne($data);
    return $result->getInsertedId();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $jsonData = json_decode($_POST['data'], true);

    if (!empty($jsonData) && isset($jsonData['type'])) {
        // Initialize the data array with default values
        $data = [
            'type' => $jsonData['type'],
            'headacheId' => $jsonData['headacheId'] ?? 'unknown_headacheId',
            'value' => 0, // Default value
            'status' => 'new', // Default status
            'timestamp' => new MongoDB\BSON\UTCDateTime(),
        ];

        if ($jsonData['type'] === 'painLevel') {
            // Handle 'painLevel' data
            $data['value'] = $jsonData['value'] ?? 0;
            $data['status'] = $jsonData['status'] ?? 'ongoing';
            $timestamp = $jsonData['timestamp'] ?? date('c');
        }

        if ($jsonData['type'] === 'headacheStart') {
            // Handle 'headacheStart' data
            $data['value'] = $jsonData['value'] ?? 0;
        }

        
        if ($jsonData['type'] === 'headacheEnd') {
            // Handle 'headacheEnd' data
            $data['value'] = $jsonData['value'] ?? 0;
            $data['status'] = $jsonData['status'] ?? 'completed'; // Set default status to "ongoing"
        }

        if ($jsonData['type'] === 'medication') {
            // Handle 'medication' data
            $data['value'] = $jsonData['value'] ?? 'unknown_medication'; // Set default medication name
            $data['status'] = $jsonData['status'] ?? 'ongoing'; // Set default status to "ongoing"
        }
        

        if ($jsonData['type'] === 'symptom') {
            // Handle 'symptom' data
            $data['value'] = $jsonData['value'] ?? 'unknown_symptom'; // Set default symptom name
            $data['status'] = $jsonData['status'] ?? 'ongoing'; // Set default status to "ongoing"
        }
        

        if ($jsonData['type'] === 'abortive') {
            // Handle 'abortive' data
            $data['value'] = $jsonData['value'] ?? 'unknown_abortive'; // Set default symptom name
            $data['status'] = $jsonData['status'] ?? 'ongoing'; // Set default status to "ongoing"
        }

        if (isset($timestamp)) {
            $data['timestamp'] = new MongoDB\BSON\UTCDateTime(strtotime($timestamp) * 1000);
        }

        $result = writeToMongoDB($data);
        echo $result ? 'Success' : 'Failure';
    } else {
        echo 'No valid data received';
    }
}

?>

