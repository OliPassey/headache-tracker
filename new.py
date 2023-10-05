from flask import Flask, request, render_template_string
from influxdb import InfluxDBClient
import json
import requests
import time
from flask import jsonify
app = Flask(__name__)

with open("config.json") as f:
    config = json.load(f)

subject = config.get('subject', 'DefaultSubject')  # DefaultSubject will be used if 'subject' is not found in the config file

index_html = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cluster Headache Tracker</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <meta http-equiv="Refresh" content="60">
</head>
<body>
    <center>
    <table id="header">
        <tr>
            <td>
                <div id="pain_scale">
                    <h2>Current Pain Level</h2>
                    <iframe src="https://grafana.passey.cloud/d-solo/n_chIOy4k/cluster-headache?orgId=1&refresh=10s&panelId=4" width="450" height="200" frameborder="0"></iframe>
                </div>
            </td>
            <td>
                <div id="current_header">
                    <h1>Cluster Headache Tracker</h1>
                    
                </div>
            </td>
            <td>
                <div id="treatment_log_header">
                    <h2>Treatment Log</h2>
                    <iframe src="https://grafana.passey.cloud/d-solo/n_chIOy4k/cluster-headache?orgId=1&refresh=10s&panelId=5" width="450" height="200" frameborder="0"></iframe>
                </div>
            </td>
        </tr>
    </table>

    <div class="graphs">
        <img src="https://grafana.passey.cloud/render/d-solo/n_chIOy4k/cluster-headache?orgId=1&refresh=10s&panelId=2&width=1000&height=400&tz=Europe%2FLondon" id="graph" width="80%" height="400px">
    </div>

    <div class="annotations">
        <button type="button" id="energy_drink">Energy Drink</button>
        <button type="button" id="oxygen_on">Oxygen On</button>
        <button type="button" id="oxygen_off">Oxygen Off</button>
        <button type="button" id="sumatriptan">Sumatriptan</button>
    </div>

    <div class="metrics">
        <button type="button" class="metric_button" data-metric="0">0</button>
        <button type="button" class="metric_button" data-metric="1">1</button>
        <button type="button" class="metric_button" data-metric="2">2</button>
        <button type="button" class="metric_button" data-metric="3">3</button>
        <button type="button" class="metric_button" data-metric="4">4</button>
        <button type="button" class="metric_button" data-metric="5">5</button>
        <button type="button" class="metric_button" data-metric="6">6</button>
        <button type="button" class="metric_button" data-metric="7">7</button>
        <button type="button" class="metric_button" data-metric="8">8</button>
        <button type="button" class="metric_button" data-metric="9">9</button>
        <button type="button" class="metric_button" data-metric="10">10</button>
    </div>

    <br><br>
    <p id="current_status">{{ current_metric }}</p>
    <p id="last_annotation">{{ last_annotation }}</p>
    <div class="authenticate">
    <a id="grafana-auth-link" href="#">Authenticate with Grafana</a>
    </div>
    <script>
        $(document).ready(function() {
            // Send pain metric to server when a button is clicked
            $('.metric_button').on('click', function() {
                var metric = $(this).data('metric');
                $.ajax({
                    type: 'POST',
                    url: '/submit',
                    data: {pain_metric: metric},
                    success: function(response) {
                        console.log('Data submitted successfully:', response);
                        updateStatus(response.current_metric, response.last_annotation);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log('Error submitting data:', textStatus, errorThrown, 'Server response:', jqXHR.responseText);
                    }
                });
            });

            // Fetch initial status
            updateStatus('{{ current_metric }}', '{{ last_annotation }}');

            // Refresh graphs and images periodically
            setInterval(refreshGraph, 60000);
            setInterval(refreshTreatmentLog, 60000);
            setInterval(refreshPainLevel, 60000);

            // Set the Grafana authentication link
            $('#grafana-auth-link').attr('href', '{{ grafana_url }}');

        });

        function createAnnotation(annotation) {
            $.ajax({
                type: 'POST',
                url: '/create_annotation',
                data: {annotation: annotation},
                success: function(response) {
                    console.log('Annotation created successfully:', response);
                    updateStatus(response.current_metric, response.last_annotation);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('Error creating annotation:', textStatus, errorThrown, 'Server response:', jqXHR.responseText);
                }
            });
        }

        function updateStatus(currentMetric, lastAnnotation) {
            $('#current_status').text('Current Pain Metric: ' + currentMetric);
            $('#last_annotation').text('Last Annotation: ' + lastAnnotation);
        }

        function refreshGraph() {
            var graphElement = document.getElementById('graph');
            graphElement.src = graphElement.src + '?' + new Date().getTime();
        }

        function refreshTreatmentLog() {
            var treatmentLogElement = document.getElementById('treatment_log');
            treatmentLogElement.src = treatmentLogElement.src + '?' + new Date().getTime();
        }

        function refreshPainLevel() {
            var painLevelElement = document.getElementById('pain_level');
            painLevelElement.src = painLevelElement.src + '?' + new Date().getTime();
        }

        $('#energy_drink').on('click', function() {
            createAnnotation('Energy Drink');
        });

        $('#oxygen_on').on('click', function() {
            createAnnotation('Oxygen On');
        });

        $('#oxygen_off').on('click', function() {
            createAnnotation('Oxygen Off');
        });

        $('#sumatriptan').on('click', function() {
            createAnnotation('Sumatriptan');
        });

    </script>
</body>
</html>
'''

# Store the initial values for current metric and last annotation
current_metric = 0
last_annotation = ''

@app.route("/")
def index():
    grafana_url = config.get('grafana', {}).get('pub_url', '#')
    return render_template_string(index_html, current_metric=current_metric, last_annotation=last_annotation, grafana_url=grafana_url)

@app.route("/submit", methods=["POST"])
def submit():
    global current_metric
    global last_annotation

    pain_metric = request.form.get("pain_metric", type=int)
    print(f"Received pain_metric: {pain_metric}")

    json_body = [
        {
            "measurement": "cluster_headache",
            "tags": {
                "subject": subject
            },
            "fields": {
                "pain_value": pain_metric
            }
        }
    ]

    print(f"JSON body: {json_body}")

    client = InfluxDBClient(host=config['influxdb']['host'], port=config['influxdb']['port'], username=config['influxdb']['username'], password=config['influxdb']['password'])
    client.switch_database(config['influxdb']['database'])

    try:
        client.write_points(json_body)

        # Update current metric
        current_metric = pain_metric

        return jsonify({'success': True, 'current_metric': current_metric, 'last_annotation': last_annotation})

    except Exception as e:
        return f"Error submitting data: {e}", 500

@app.route("/create_annotation", methods=["POST"])
def create_annotation():
    global last_annotation

    annotation = request.form.get("annotation")

    headers = {
        "Authorization": f"Bearer {config['grafana']['api_key']}",
        "Content-Type": "application/json"
    }

    data = {
        "dashboardUid": config['grafana']['dashboard_uid'],
        "panelId": config['grafana']['panel_id'],
        "time": int(time.time() * 1000),
        "text": annotation,
        "tags": ["treatment"]
    }

    response = requests.post(f"{config['grafana']['url']}/api/annotations", headers=headers, json=data)

    if response.status_code == 200:
        # Update last annotation
        last_annotation = annotation

        return jsonify({'success': True, 'current_metric': current_metric, 'last_annotation': last_annotation})
    else:
        return f"Error creating annotation: {response.text}", 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
