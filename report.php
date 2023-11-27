<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include the MongoDB PHP driver
require 'vendor/autoload.php';

// Read the MongoDB configuration from config.json
$configJson = file_get_contents('config.json');
$config = json_decode($configJson, true);

// Extract MongoDB connection details
$mongoDBConfig = $config['MongoDB'];
$mongoIP = $mongoDBConfig['IP'];
$mongoPort = $mongoDBConfig['Port'];
$mongoDatabase = $mongoDBConfig['Database'];
$mongoCollection = $mongoDBConfig['Collection'];

// Create the MongoDB connection string
$mongoConnectionString = "mongodb://$mongoIP:$mongoPort";

// Check if headacheId is provided via POST
if (isset($_GET['headacheId'])) {
    $headacheId = $_GET['headacheId'];

// Set up the MongoDB connection
$client = new MongoDB\Client($mongoConnectionString);
$collection = $client->selectCollection($mongoDatabase, $mongoCollection);



// Fetch data from MongoDB
$query = new MongoDB\Driver\Query(['headacheId' => $headacheId]);
$cursor = $collection->find($query);

// Initialize summary variables
$painLevels = [];
$abortiveActions = [];
$symptoms = [];
$startTime = null;
$endTime = null;
$painLevelsData = [];
$oxygenOnTime = null;
$oxygenOffTime = null;

// Process the data
foreach ($cursor as $document) {
    // Check if the document matches the specified headacheId
    if ($document['headacheId'] === $headacheId) {
        $docType = $document['type'];
        $docValue = $document['value'];
        $timestamp = $document['timestamp']->toDateTime()->format('H:i:s');
        $fullTimestamp = $document['timestamp']->toDateTime()->format('H:i:s'); // For graph data


    switch ($docType) {
        case 'headacheStart':
            $startTime = $document['timestamp']->toDateTime();
            $startTimeFormatted = $startTime->format('d M Y H:i:s');
            $startTimestamp = $startTime->format('H:i:s'); // For graph data
            // Add start time with pain level 0 to the graph data
            $painLevelsData[] = ['x' => $startTimestamp, 'y' => 0];
            break;        

        case 'painLevel':
            $painLevels[] = $docValue;
            // Add pain level data for the graph
            $painLevelsData[] = ['x' => $fullTimestamp, 'y' => $docValue];
            break;

        case 'abortive':
            $abortiveActions[] = ['action' => $docValue, 'timestamp' => $timestamp];
            // Track Oxygen On and Off times
            if ($docValue === 'Oxygen On') {
                $oxygenOnTime = $document['timestamp']->toDateTime();
            } elseif ($docValue === 'Oxygen Off') {
                $oxygenOffTime = $document['timestamp']->toDateTime();
            }
            break;

        case 'symptom':
            $symptoms[] = $docValue;
            break;

        case 'headacheEnd':
            $endTime = $document['timestamp']->toDateTime();
            $endTimeFormatted = $endTime->format('d M Y H:i:s');
            $endTimestamp = $endTime->format('H:i:s'); // For graph data
            // Add end time with pain level 0 to the graph data
            $painLevelsData[] = ['x' => $endTimestamp, 'y' => 0];
            break;
        }   
    }
}

// Calculate total headache duration
if ($startTime && $endTime) {
    $totalHeadacheDuration = $startTime->diff($endTime);
    // Format duration as hours and minutes
    $totalHeadacheDurationFormatted = $totalHeadacheDuration->format('%h hours %i minutes');
} else {
    $totalHeadacheDurationFormatted = "Not available";
}

// Calculate time between Oxygen On and Off
if ($oxygenOnTime && $oxygenOffTime) {
    $oxygenDuration = $oxygenOnTime->diff($oxygenOffTime);
    // Format duration as hours and minutes
    $oxygenDurationFormatted = $oxygenDuration->format('%h hours %i minutes');
} else {
    $oxygenDurationFormatted = "Not available";
}

// Extract data for graphing

echo "<script>";
echo "var painLevelData = " . json_encode($painLevelsData) . ";";
echo "</script>";
?>
<link rel="stylesheet" href="style.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    var ctx = document.getElementById('painLevelChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Pain Level',
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                data: painLevelData
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'minute'
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
});
</script>
</div>
<?php
// Calculate the average pain level and round to one decimal place
$averagePainLevel = round(array_sum($painLevels) / count($painLevels), 1);
// Check if there are pain level records
if (count($painLevels) > 0) {
    $averagePainLevel = round(array_sum($painLevels) / count($painLevels), 1);
} else {
    $averagePainLevel = 0; // Or any default value you prefer
}


// Summarize the information

echo "<div class='report-section'>";
echo "<h2 class='report-header'>Headache Summary for ID: $headacheId</h2>";
echo "<p>Start Time: $startTimeFormatted</p>";
echo "<p>End Time: $endTimeFormatted</p>";
echo "<p>Total Headache Time: $totalHeadacheDurationFormatted</p>";
echo "<p>Time On Oxygen: $oxygenDurationFormatted</p>";
echo "<p>Average Pain Level: $averagePainLevel</p>";

// Table for abortive actions
echo "<h2 class='report-header'>Abortive Actions</h2>";
echo "<table class='report-table'>";
echo "<tr><th>Action</th><th>Timestamp</th></tr>";
foreach ($abortiveActions as $action) {
    echo "<tr>";
    echo "<td>" . htmlspecialchars($action['action']) . "</td>";
    echo "<td>" . htmlspecialchars($action['timestamp']) . "</td>";
    echo "</tr>";
}
echo "</table>";

// Chart Container
echo "<div class='chart-container'>";
echo "<canvas id='painLevelChart'></canvas>";
echo "</div>";

echo "</div>"; // Closing report-section div
} else {
    echo "No headacheId provided.";
    exit; // Stop further execution if headacheId is not provided
}
?>