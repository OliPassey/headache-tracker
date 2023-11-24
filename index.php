<?php

// Check if configuration files exist
$configFiles = ['config.json', 'patient.json', 'pain.json'];
foreach ($configFiles as $file) {
    if (!file_exists($file)) {
        // Redirect to setup.php if a configuration file is missing
        header('Location: setup.php');
        exit;
    }
}

// Assuming the files exist, you can read them here
$config = json_decode(file_get_contents('config.json'), true);
$patient = json_decode(file_get_contents('patient.json'), true);
$painScale = json_decode(file_get_contents('pain.json'), true);

// Read medications, abortive methods, and symptoms from patient.json or another appropriate file
$medications = $patient['presMedications'] ?? [];
$abortiveMethods = $patient['abortives'] ?? [];
$symptoms = $patient['symptoms'] ?? [];
?>
<!DOCTYPE html>
<html>
<head>
    <title>Patient Pain Log</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <center>
    <button type="button" class="start-headache-btn" onclick="startNewHeadache()">Start New Headache</button>

    <h2>Current Pain</h2>
    <div class="grid-container pain-level-grid">
        <?php for ($i = 0; $i <= 10; $i++): ?>
            <button type="button" class="pain-level-button" onclick="logPainLevel(<?php echo $i; ?>)"><?php echo $i; ?></button>
        <?php endfor; ?>
    </div>

    <!-- Medications -->
    <h2>Medication</h2>
    <div class="grid-container item-grid">
        <?php foreach ($medications as $medication): ?>
            <button type="button" onclick="logMedication('<?php echo $medication; ?>')"><?php echo $medication; ?></button>
        <?php endforeach; ?>
    </div>

    <!-- Abortive Methods -->
    <h2>Abortives</h2>
    <div class="grid-container item-grid">
        <?php foreach ($abortiveMethods as $method): ?>
            <button type="button" onclick="logMethod('<?php echo $method; ?>')"><?php echo $method; ?></button>
        <?php endforeach; ?>
    </div>

    <!-- Symptoms -->
    <h2>Symptoms</h2>
    <div class="grid-container item-grid">
        <?php foreach ($symptoms as $symptom): ?>
            <button type="button" onclick="logSymptom('<?php echo $symptom; ?>')"><?php echo $symptom; ?></button>
        <?php endforeach; ?>
    </div>

    </center>

    <script>
        function logPainLevel(level) {
            // Remove 'active' class from all buttons
            document.querySelectorAll('.pain-level-button').forEach(function(button) {
                button.classList.remove('active');
            });

            // Add 'active' class to the clicked button
            var button = document.querySelector('.pain-level-button:nth-child(' + (level + 1) + ')');
            button.classList.add('active');

            // Here you can add code to handle the logging of the pain level
            // Send pain level to writeInflux.php
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "writeInflux.php", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    // Handle response here. For example, show a message to the user.
                }
            }
            xhr.send("painLevel=" + level);
        }
        
        function startNewHeadache() {
            logPainLevel(0); // Logs a pain level of 0 at the current time
        }

        function logData(dataType, dataValue) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "writeMongo.php", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    console.log(dataType + ' logged: ' + dataValue);
                }
            }
            xhr.send("data=" + encodeURIComponent(JSON.stringify({type: dataType, value: dataValue})));
        }

        function logMedication(medication) {
            logData('medication', medication);
        }

        function logMethod(method) {
            logData('abortiveMethod', method);
        }

        function logSymptom(symptom) {
            logData('symptom', symptom);
        }

    </script>
</body>
</html>
