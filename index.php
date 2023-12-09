<?php

// Check if configuration files exist
$configFiles = ['conf/config.json', 'conf/patient.json', 'conf/pain.json'];
foreach ($configFiles as $file) {
    if (!file_exists($file)) {
        // Redirect to setup.php if a configuration file is missing
        header('Location: setup.php');
        exit;
    }
}

// Assuming the files exist, you can read them here
$config = json_decode(file_get_contents('conf/config.json'), true);
$patient = json_decode(file_get_contents('conf/patient.json'), true);
$painScale = json_decode(file_get_contents('conf/pain.json'), true);

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
    <!-- List Button -->
    <a href='list.php' class='list-button'>View All Headaches</a>
    <br><br>

    <button type="button" class="start-headache-btn" onclick="startNewHeadache()">Start New Headache</button>
    <div id="start-headache-id" class="fade-in">Headache ID: <span id="generated-headache-id"></span></div>

    <h2>Current Pain</h2>
    <!-- Pain Level Description Display -->
    <div id="pain-level-description"></div>
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
        <?php foreach ($abortiveMethods as $abortive): ?>
            <button type="button" onclick="logAbortive('<?php echo $abortive; ?>')"><?php echo $abortive; ?></button>
        <?php endforeach; ?>
    </div>

    <!-- Symptoms -->
    <h2>Symptoms</h2>
    <div class="grid-container item-grid">
        <?php foreach ($symptoms as $symptom): ?>
            <button type="button" onclick="logSymptom('<?php echo $symptom; ?>')"><?php echo $symptom; ?></button>
        <?php endforeach; ?>
    </div>

    <h2>Recovery</h2>
    <button type="button" class="end-headache-btn" onclick="endHeadache()">End Headache</button>
    <div id="end-headache-id"></div> <!-- Use a unique id for the End Headache section -->
    </center>

    <script>
        function logPainLevel(level) {
            var headacheId = sessionStorage.getItem('currentHeadacheId');

            // Fetch and display pain level description
            fetchPainLevelDescription(level);

            // Remove 'active' class from all buttons
            document.querySelectorAll('.pain-level-button').forEach(function(button) {
                button.classList.remove('active');
            });

            // Add 'active' class to the clicked button
            var button = document.querySelector('.pain-level-button:nth-child(' + (level + 1) + ')');
            button.classList.add('active');

            // Prepare data object with top-level fields
            var data = {
                type: 'painLevel',
                value: level,
                headacheId: headacheId, // Include headacheId in the data sent to the server
                timestamp: new Date().toISOString(),
                status: 'ongoing' // Assuming a status, modify as needed
            };

            // Send pain level data to writeMongo.php
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "writeMongo.php", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    // Handle response here, e.g., show a message to the user
                }
            };
            xhr.send("data=" + encodeURIComponent(JSON.stringify(data)));
        }

        function fetchPainLevelDescription(level) {
            var painLevelDescription = document.getElementById('pain-level-description');

            // Fetch pain level descriptions
            fetch('pain.json')
                .then(response => response.json())
                .then(data => {
                    // Find the description matching the selected level
                    var levelDescription = data.levels.find(l => l.value === level)?.description || 'Description not found';
                    
                    // Update the pain level description display
                    painLevelDescription.textContent = 'Pain Level ' + level + ': ' + levelDescription;
                })
                .catch(error => console.error('Error:', error));
        }

        
        function startNewHeadache() {
            // Generate a unique headache ID
            var headacheId = generateHeadacheId(5) + "-" + generateTimestampId();
            sessionStorage.setItem('currentHeadacheId', headacheId);

            // Display the headache ID for starting a new headache
            var startHeadacheIdDiv = document.getElementById('start-headache-id');
            startHeadacheIdDiv.textContent = "Headache ID: " + headacheId;

            // Prepare the data object to send for starting a new headache
            var data = {
                type: 'headacheStart',
                headacheId: headacheId,
                status: 'new',
                value: 0,
                timestamp: new Date().toISOString()
            };

            // Send data to writeMongo.php
            logData(data);

            // Remove 'active' class from all buttons
            document.querySelectorAll('.pain-level-button').forEach(function(button) {
                button.classList.remove('active');
            });

            // Add 'active' class to the first pain scale button
            var firstButton = document.querySelector('.pain-level-button:nth-child(1)');
            firstButton.classList.add('active');
        }

        function endHeadache() {
            var headacheId = sessionStorage.getItem('currentHeadacheId');
            if (headacheId) {
                // Prepare the data object to send for ending a headache
                var data = {
                    type: 'headacheEnd',
                    headacheId: headacheId,
                    timestamp: new Date().toISOString(),
                    status: 'complete',
                    value: 0
                };

                // Send data to writeMongo.php
                logData(data);

                // Update the end-headache-id div to display the "View Report" link
                var endHeadacheIdDiv = document.getElementById('end-headache-id');
                endHeadacheIdDiv.innerHTML = '<a href="report.php?headacheId=' + encodeURIComponent(headacheId) + '">View Report</a>';

                // Remove the stored headache ID from sessionStorage
                sessionStorage.removeItem('currentHeadacheId');
            }
        }


        function generateHeadacheId(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        function generateTimestampId() {
            var now = new Date();
            return now.getFullYear().toString() + 
                (now.getMonth() + 1).toString().padStart(2, '0') + 
                now.getDate().toString().padStart(2, '0') + 
                now.getHours().toString().padStart(2, '0') + 
                now.getMinutes().toString().padStart(2, '0') + 
                now.getSeconds().toString().padStart(2, '0');
        }

        function logData(data) {
            // Send pain level data to writeMongo.php
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "writeMongo.php", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    // Handle response here, e.g., show a message to the user
                }
            };
            xhr.send("data=" + encodeURIComponent(JSON.stringify(data)));
        }


        function logMedication(medication) {
            var headacheId = sessionStorage.getItem('currentHeadacheId');
            var data = {
                type: 'medication',
                value: medication, // Pass the medication name as a string
                headacheId: headacheId,
                timestamp: new Date().toISOString(),
                status: 'ongoing' // Assuming a status, modify as needed
            };
            logData(data); // Pass the data object to logData function
        }

        function logAbortive(abortive) {
            var headacheId = sessionStorage.getItem('currentHeadacheId');
            var data = {
                type: 'abortive',
                value: abortive, // Pass the medication name as a string
                headacheId: headacheId,
                timestamp: new Date().toISOString(),
                status: 'ongoing' // Assuming a status, modify as needed
            };
            logData(data); // Pass the data object to logData function
        }

        function logSymptom(symptom) {
            var headacheId = sessionStorage.getItem('currentHeadacheId');
            var data = {
                type: 'symptom',
                value: symptom, // Pass the medication name as a string
                headacheId: headacheId,
                timestamp: new Date().toISOString(),
                status: 'ongoing' // Assuming a status, modify as needed
            };
            logData(data); // Pass the data object to logData function
        }

    </script>
</body>
</html>
