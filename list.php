<?php

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

// Fetch all headache start documents and sort them by timestamp
$filter = ['type' => 'headacheStart'];
$options = ['sort' => ['timestamp' => -1]]; // Sort in descending order

$cursor = $collection->find($filter, $options);

// Extract distinct headacheIds from the sorted documents
$headacheIds = [];
foreach ($cursor as $doc) {
    if (!in_array($doc['headacheId'], $headacheIds)) {
        $headacheIds[] = $doc['headacheId'];
    }
}

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
