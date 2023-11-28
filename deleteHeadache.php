<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'vendor/autoload.php';

// MongoDB connection setup (similar to report.php)
$configJson = file_get_contents('config.json');
$config = json_decode($configJson, true);
$mongoDBConfig = $config['MongoDB'];
$mongoIP = $mongoDBConfig['IP'];
$mongoPort = $mongoDBConfig['Port'];
$mongoDatabase = $mongoDBConfig['Database'];
$mongoCollection = $mongoDBConfig['Collection'];

$mongoConnectionString = "mongodb://$mongoIP:$mongoPort";
$client = new MongoDB\Client($mongoConnectionString);
$collection = $client->selectCollection($mongoDatabase, $mongoCollection);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['headacheId'])) {
    $headacheId = $_POST['headacheId'];
    
    // Perform the deletion
    $result = $collection->deleteMany(['headacheId' => $headacheId]);

    // Redirect or inform the user after deletion
    header('Location: list.php'); // Redirect to index.php or another appropriate page
    exit;
} else {
    echo "Invalid request";
}
?>
