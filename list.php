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

// Function to get max pain level for a headache
function getMaxPainLevel($collection, $headacheId) {
    $filter = ['headacheId' => $headacheId, 'type' => 'painLevel'];
    $options = [
        'sort' => ['value' => -1], // Sort in descending order by pain level
        'limit' => 1 // Limit to 1 document
    ];

    $result = $collection->findOne($filter, $options);
    return $result ? $result['value'] : 'N/A';
}

// Function to get start time for a headache
function getStartTime($collection, $headacheId) {
    $filter = ['headacheId' => $headacheId, 'type' => 'headacheStart'];
    $result = $collection->findOne($filter);

    return $result ? $result['timestamp']->toDateTime()->format('d-m-Y') : 'N/A';
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Headache ID List</title>
    <link rel="stylesheet" href="style.css">
    <style>

    </style>
</head>
<body>
    <!-- Home Button -->
    <a href='index.php' class='home-button'>Home</a>
    <br><br>
    
    <h1>Headache Reports</h1>
    <table>
        <tr>
            <th>Headache ID</th>
            <th>Start Time</th>
            <th>Max Pain Level</th>
            <th>Report</th>
        </tr>
        <?php foreach ($headacheIds as $id): ?>
        <tr>
            <td><?php echo htmlspecialchars(substr($id, 0, 5)); ?></td>
            <td><?php echo getStartTime($collection, $id); ?></td>
            <td class="center-text"><?php echo getMaxPainLevel($collection, $id); ?></td>
            <td><a href="report.php?headacheId=<?php echo urlencode($id); ?>" class="report-button">View Report</a></td>
        </tr>
        <?php endforeach; ?>
    </table>
</body>
</html>
