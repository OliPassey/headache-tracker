<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include the MongoDB PHP driver
require 'vendor/autoload.php';

// Initialize variables
$showPatientForm = false;
$patientConfigCreated = false;
$painConfigCreated = false;

// Recieve step 1 config relating to infrastrucutre, write to config.json
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['createConfig'])) {
    // Extract the data from the POST request
    $data = [
        "MongoDB" => [
            "IP" => $_POST['mongodb_ip'],
            "Port" => $_POST['mongodb_port'],
            "Database" => $_POST['mongodb_database'],
            "Collection" => $_POST['mongodb_collection']
        ],
        "InfluxDB" => [
            "Host" => $_POST['influxdb_host'],
            "Port" => $_POST['influxdb_port'],
            "User" => $_POST['influxdb_user'],
            "Pass" => $_POST['influxdb_pass'],
            "Database" => $_POST['influxdb_database']
        ]
    ];

    // Convert data to JSON format
    $json_data = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

    // Save JSON data to a file
    file_put_contents('config.json', $json_data);

    // Show the second part of the form
    $showPatientForm = true;
}

// Recieve step 2 config relating to patient, write to patient.json
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['createConfig'])) {
        // Previous code to handle infrastructure configuration
        // ...
        $showPatientForm = true;
    } elseif (isset($_POST['createPatientConfig'])) {
        // New code to handle patient configuration
        $patientData = [
            "fName" => $_POST['first_name'],
            "lName" => $_POST['last_name'],
            "prefName" => $_POST['pref_name'],
            "dob" => $_POST['dob'],
            "gender" => $_POST['gender'],
            "smoker" => $_POST['smoker'],
            "1stHeadache" => $_POST['first_headache_year'],
            "headacheType" => $_POST['headache_type'],
            "presMedications" => $_POST['prescribed_meds'] ?? [],
            "abortives" => $_POST['abortive_methods'] ?? [],
            "symptoms" => $_POST['symptoms'] ?? []
        ];

        // Convert data to JSON format
        $json_patient_data = json_encode($patientData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        // Save JSON data to a file
        file_put_contents('patient.json', $json_patient_data);

        // Optionally, set a flag or message indicating success
        $patientConfigCreated = true;
    }
}

// Receive step 3 config relating to pain scales, write to pain.json
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['createPainConfig'])) {
        if ($_POST['painScale'] === 'custom') {
            // Handle custom pain scale creation
            $painData = json_decode($_POST['customPainData'], true);
            file_put_contents('pain.json', json_encode($painData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } else {
            // Copy content from selected predefined file
            copy($_POST['painScale'] . '.json', 'pain.json');
        }
        $painConfigCreated = true;
    }
}

// Redirect if necessary
if (isset($painConfigCreated) && $painConfigCreated) {
    header('Location: index.php');
    exit; // Make sure to exit after sending a header redirect
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Setup Configuration</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h2>Infrastructure Configuration</h2>
    <form method="post">
        <h3>MongoDB Configuration</h3>
        IP: <input type="text" name="mongodb_ip" required><br>
        Port: <input type="number" name="mongodb_port" required><br>
        Database: <input type="text" name="mongodb_database" required><br>
        Collection: <input type="text" name="mongodb_collection" required><br>
        <input type="submit" name="createConfig" value="Create Config">
    </form>
</body>
</html>

<?php if (isset($showPatientForm) && $showPatientForm): ?>
    <h2>Patient Configuration</h2>
    <form method="post">
        First Name: <input type="text" name="first_name" required><br>
        Last Name: <input type="text" name="last_name" required><br>
        Preferred Name: <input type="text" name="pref_name"><br>
        Date of Birth: <input type="date" name="dob" required><br>
        Gender: <input type="text" name="gender" required><br>
        Smoker: <select name="smoker" required>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select><br>
        Year of 1st Headache: <input type="number" name="first_headache_year" required><br>
        Headache Type: <input type="text" name="headache_type" required><br>
        <h3>Medications</h3>
        <div id="medications">
            <input type="text" name="prescribed_meds[]">
        </div>
        <button type="button" onclick="addMedication()">Add More Medication</button><br>

        <h3>Abortive Methods</h3>
        <div id="abortiveMethods">
            <input type="text" name="abortive_methods[]">
        </div>
        <button type="button" onclick="addAbortiveMethod()">Add More Method</button><br>

        <h3>Symptoms</h3>
        <div id="symptoms">
            <input type="text" name="symptoms[]">
        </div>
        <button type="button" onclick="addSymptom()">Add More Symptom</button><br>

        <input type="submit" name="createPatientConfig" value="Create Patient Config">
    </form>

    <?php if (isset($patientConfigCreated) && $patientConfigCreated): ?>
            <p>Patient configuration saved successfully!</p>
        <?php endif; ?>

    <script>
        function addMedication() {
            var container = document.getElementById("medications");
            var input = document.createElement("input");
            input.type = "text";
            input.name = "prescribed_meds[]";
            container.appendChild(input);
        }

        function addAbortiveMethod() {
            var container = document.getElementById("abortiveMethods");
            var input = document.createElement("input");
            input.type = "text";
            input.name = "abortive_methods[]";
            container.appendChild(input);
        }

        function addSymptom() {
            var container = document.getElementById("symptoms");
            var input = document.createElement("input");
            input.type = "text";
            input.name = "symptoms[]";
            container.appendChild(input);
        }
    </script>
    <?php endif; ?>

    <h2>Pain Scale Configuration</h2>
    <form method="post">
        <input type="radio" name="painScale" value="uk_nhs" required> Use UK NHS Pain Scale<br>
        <input type="radio" name="painScale" value="us_med" required> Use US Medical Pain Scale<br>
        <input type="radio" name="painScale" value="custom" required> Create Custom Pain Scale<br>

        <div id="customPainScale" style="display:none;">
            <textarea name="customPainData" rows="10" cols="50">
            {
            "scaleType": "custom",
            "levels": [
                {
                "value": 0,
                "description": "No pain"
                },
                {
                "value": 1,
                "description": "Loss of Focus / Muscle Twitching"
                },
                {
                "value": 2,
                "description": "Tension in head / Stiffness"
                },
                {
                "value": 3,
                "description": "Dull Pain in one area - Distracting"
                },
                {
                "value": 4,
                "description": "Dull Pain whole side of head - Severely Distracting"
                },
                {
                "value": 5,
                "description": "Throbbing Pain - Unable to work or function normally"
                },
                {
                "value": 6,
                "description": "Severe Throbbing Pain in one area"
                },
                {
                "value": 7,
                "description": "Severe Throbbing Pain whole side of head"
                },
                {
                "value": 8,
                "description": "Stabbing Pains"
                },
                {
                "value": 9,
                "description": "Crying out or Wriggling in Pain"
                },
                {
                "value": 10,
                "description": "Unconscious"
                }
            ]
            }
            </textarea>
        </div>
        <input type="submit" name="createPainConfig" value="Create Pain Scale">
    </form>

    <?php if (isset($painConfigCreated) && $painConfigCreated): ?>
        <p>Pain scale configuration saved successfully!</p>
    <?php header('Location: index.php');  
    endif;    
    ?>
    <script>
        document.querySelectorAll('input[name="painScale"]').forEach((elem) => {
            elem.addEventListener('change', function(event) {
                var value = event.target.value;
                var customDiv = document.getElementById('customPainScale');
                if (value === 'custom') {
                    customDiv.style.display = 'block';
                } else {
                    customDiv.style.display = 'none';
                }
            });
        });
    </script>
</body>
</html>