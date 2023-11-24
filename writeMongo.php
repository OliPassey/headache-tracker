<?php
require_once 'vendor/autoload.php';

function getMongoDBConfig() {
    $config = json_decode(file_get_contents('config.json'), true);
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
    $data = [
        'type' => $jsonData['type'] ?? 'unknown',
        'value' => $jsonData['value'] ?? '',
        'timestamp' => new MongoDB\BSON\UTCDateTime()
    ];
    $result = writeToMongoDB($data);
    echo $result ? 'Success' : 'Failure';
}


?>