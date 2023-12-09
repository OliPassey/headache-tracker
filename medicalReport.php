<?php
// Include the MongoDB PHP driver
require 'vendor/autoload.php';

// MongoDB connection setup
$configJson = file_get_contents('conf/config.json');
$config = json_decode($configJson, true);

$mongoDBConfig = $config['MongoDB'];
$mongoIP = $mongoDBConfig['IP'];
$mongoPort = $mongoDBConfig['Port'];
$mongoDatabase = $mongoDBConfig['Database'];
$mongoCollection = $mongoDBConfig['Collection'];

$mongoConnectionString = "mongodb://$mongoIP:$mongoPort";
$client = new MongoDB\Client($mongoConnectionString);
$collection = $client->selectCollection($mongoDatabase, $mongoCollection);

// Fetch all headache documents sorted by timestamp
$filter = []; // Empty filter to fetch all documents
$options = ['sort' => ['timestamp' => 1]]; // Sort in ascending order for calculating first and last headache
$cursor = $collection->find($filter, $options);

// Variables for calculating summaries
$firstHeadacheDate = null;
$latestHeadacheDate = null;
$totalHeadaches = 0;
$headacheData = [];

foreach ($cursor as $doc) {
    $headacheId = $doc['headacheId'];
    $timestamp = $doc['timestamp']->toDateTime()->format('d-m-Y H:i');

    // Initialize a new headache record if it doesn't exist
    if (!isset($headacheData[$headacheId])) {
        $headacheData[$headacheId] = [
            'start' => null,
            'end' => null,
            'painLevels' => [],
            'abortiveActions' => [],
            'symptoms' => []
        ];
    }

    switch ($doc['type']) {
        case 'headacheStart':
            $totalHeadaches++;
            $headacheData[$headacheId]['start'] = $timestamp;
            if (!$firstHeadacheDate) {
                $firstHeadacheDate = $timestamp;
            }
            $latestHeadacheDate = $timestamp;
            break;

        case 'headacheEnd':
            $headacheData[$headacheId]['end'] = $timestamp;
            break;

        case 'painLevel':
            $painTimestamp = $doc['timestamp']->toDateTime();
            $formattedTimestamp = $painTimestamp->format(DateTime::ATOM); // Format as ISO 8601
            $headacheData[$headacheId]['painLevels'][] = [
                'level' => $doc['value'],
                'timestamp' => $formattedTimestamp
            ];
            break;

        case 'abortive':
            $headacheData[$headacheId]['abortiveActions'][] = [
                'action' => $doc['value'],
                'timestamp' => $timestamp
            ];
            break;

        case 'symptom':
            $headacheData[$headacheId]['symptoms'][] = [
                'symptom' => $doc['value'],
                'timestamp' => $timestamp
            ];
            break;

        // Add additional cases as necessary for other document types
    }
}


// Duration calculation
$firstDate = new DateTime($firstHeadacheDate);
$latestDate = new DateTime($latestHeadacheDate);
$duration = $firstDate->diff($latestDate);

// Read patient data
$patientData = json_decode(file_get_contents('patient.json'), true);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Medical Advisory</title>
    <link rel="stylesheet" href="style.css">
    <script src="js/chartjs/chart.umd.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/moment@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-moment@latest"></script>
</head>
<body>

<script>
document.addEventListener('DOMContentLoaded', function() {
    <?php foreach ($headacheData as $id => $data):
        $jsId = str_replace('-', '_', $id); 
        $painLevelData = array_map(function($pl) {
            // Convert MongoDB timestamp to ISO 8601 format
            return ['x' => (new DateTime($pl['timestamp']))->format(DateTime::ATOM), 'y' => $pl['level']];
        }, $data['painLevels']);
    ?>
        var ctx = document.getElementById('painLevelChart<?php echo $jsId; ?>').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Pain Level',
                    backgroundColor: 'purple',
                    borderColor: 'purple',
                    data: <?php echo json_encode($painLevelData); ?>,
                    tension: 0.6
                }]
            },
            options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Pain Levels Over Time',
                    font: {
                        size: 26 // Set title font size
                    }
                },
                legend: {
                    labels: {
                        font: {
                            size: 20 // Set legend labels font size
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
            },
            scales: {
                x: {
                    type: 'time',
                        time: {
                    display: true,
                    title: {
                        display: false,
                        text: 'Time',
                        font: {
                            size: 24 // Set x-axis title font size
                        }
                    },
                    ticks: {
                        callback: function(val, index) {
                            // Hide every 2nd tick label
                            return index % 2 === 0 ? this.getLabelForValue(val) : '';
                        },
                        font: {
                            size: 18 // Set x-axis ticks font size
                        }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: false,
                        text: 'Pain Level',
                        font: {
                            size: 32 // Set y-axis title font size
                        }
                    },
                    ticks: {
                        font: {
                            size: 24 // Set y-axis ticks font size
                        }
                    },
                    suggestedMin: 0,
                    suggestedMax: 10
                }
            }
        }}
    });
    <?php endforeach; ?>
});
</script>

<?php

// Generate report
echo "<h1>Medical Report for " . htmlspecialchars($patientData['fName']) . " " . htmlspecialchars($patientData['lName']) . "</h1>";

// ... rest of your report generation code ...


// Summary
echo "<h2>Summary</h2>";
echo "<p>Total Headaches in cycle: $totalHeadaches</p>";
echo "<p>First Headache Date: $firstHeadacheDate</p>";
echo "<p>Latest / Last Headache Date: $latestHeadacheDate</p>";
echo "<p>Cycle Length: " . $duration->format('%y years, %m months, %d days') . "</p>";

echo "<h2>Detailed Headache Information</h2>";
foreach ($headacheData as $id => $data) {
    // Replace hyphens in the headacheId for JavaScript compatibility
    $jsId = str_replace('-', '_', $id);
    echo "<div class='headache-section'>";
    echo "<h3>Headache ID: " . htmlspecialchars($id) . "</h3>";
    echo "<p>Start: " . htmlspecialchars($data['start']) . "</p>";
    echo "<p>End: " . htmlspecialchars($data['end']) . "</p>";

    // Prepare data for Chart.js
    $painLevelData = [];
    foreach ($data['painLevels'] as $pain) {
        $painLevelData[] = ['x' => $pain['timestamp'], 'y' => $pain['level']];
    }

    // Canvas for Chart.js
    echo "<div class='chart-container'>";
    echo "<canvas id='painLevelChart$jsId'></canvas>";
    echo "</div>";

    echo "<script>";
    echo "var painLevelData$jsId = " . json_encode($data['painLevels']) . ";";
    echo "</script>";
    echo "</div>";
}   

    // Similar loops for abortiveActions and symptoms
    

?>
