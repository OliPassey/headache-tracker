<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include the MongoDB PHP driver
require 'vendor/autoload.php';

// Your MongoDB connection setup (similar to report.php)
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

// Fetch distinct headache IDs
$headacheIds = $collection->distinct('headacheId');

?>
<!DOCTYPE html>
<html>
<head>
    <title>Headache ID List</title>
    <link rel="stylesheet" href="style.css"> <!-- Include your stylesheet if needed -->
</head>
<body>
    <h1>Headache Reports</h1>
    <ul>
        <?php foreach ($headacheIds as $id): ?>
            <li><a href="report.php?headacheId=<?php echo urlencode($id); ?>">Report for <?php echo htmlspecialchars($id); ?></a></li>
        <?php endforeach; ?>
    </ul>
</body>
</html>
