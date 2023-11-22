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
// $config = json_decode(file_get_contents('config.json'), true);
// $patient = json_decode(file_get_contents('patient.json'), true);
// $painScale = json_decode(file_get_contents('pain.json'), true);

// Rest of your PHP code
?>

<!DOCTYPE html>
<html>
<head>
    <title>Patient Pain Log</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h2>Log Headache Start</h2>
    <div>
        <button type="button" class="start-time-button" onclick="logHeadacheStart(5)">Started 5 mins ago</button>
        <button type="button" class="start-time-button" onclick="logHeadacheStart(10)">Started 10 mins ago</button>
        <button type="button" class="start-time-button" onclick="logHeadacheStart(15)">Started 15 mins ago</button>
    </div><br><br>
    <h1>Patient Pain Log</h1>
    <div id="painLevelButtons">
        <?php for ($i = 0; $i <= 10; $i++): ?>
            <button type="button" class="pain-level-button" onclick="logPainLevel(<?php echo $i; ?>)"><?php echo $i; ?></button>
        <?php endfor; ?>
    </div>

    <!-- Additional form elements and JavaScript will go here -->
    
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
        
        function logHeadacheStart(minutesAgo) {
            // Calculate the timestamp for when the headache started
            var startTime = new Date(new Date().getTime() - minutesAgo * 60000).getTime();

            // Send the start time and level 0 to writeInflux.php
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "writeInflux.php", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    // Handle response here. For example, show a message to the user.
                }
            }
            xhr.send("painLevel=0&startTime=" + startTime);
        }

    </script>
</body>
</html>
