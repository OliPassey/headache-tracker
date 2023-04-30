from flask import Flask, request, render_template_string
from influxdb import InfluxDBClient
import json
import requests
import time

app = Flask(__name__)

with open("config.json") as f:
    config = json.load(f)

index_html = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cluster Headache Tracker</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

</head>
<body>
        <h1>Cluster Headache Tracker</h1>
    <form>
        <label for="pain_metric">Pain Metric:</label>
        <input type="range" min="0" max="10" step="1" name="pain_metric" id="pain_metric" value="0">
        <div class="slider-markers">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
            <span>9</span>
            <span>10</span>
        </div>
    </form>
    <div class="nhs-pain-scale">
        <h2>NHS Pain Scale:</h2>
        <p>0 - Pain free</p>
        <p>1 - Very minor annoyance - occasional and of short duration</p>
        <p>2 - Minor annoyance - occasional and of moderate duration</p>
        <p>3 - Annoying enough to be distracting</p>
        <p>4 - Can be ignored if you are really involved in your work, but still distracting</p>
        <p>5 - Can't be ignored for more than 30 minutes</p>
        <p>6 - Can't be ignored for any length of time, but you can still go to work and participate in social activities</p>
        <p>7 - Makes it difficult to concentrate, interferes with sleep, you can still function with effort</p>
        <p>8 - Physical activity severely limited, you can read and converse with effort, can't sleep</p>
        <p>9 - Unable to speak, crying out or moaning uncontrollably - pain makes you pass out</p>
        <p>10 - Unconscious</p>
    </div>
    <br><br>
    <iframe src="http://10.0.0.54:3000/d/n_chIOy4k/cluster-headache?orgId=1&from=now-30m&to=now&refresh=10s" width="100%" height="500px"></iframe>
    <div class="annotations">
        <button type="button" id="energy_drink">Energy Drink</button>
        <button type="button" id="oxygen_on">Oxygen On</button>
        <button type="button" id="oxygen_off">Oxygen Off</button>
        <button type="button" id="sumatriptan">Sumatriptan</button>
    </div>

    <script>
        $(document).ready(function() {
            // Initialize slider markers
            var sliderMarkers = $('.slider-markers');
            if (sliderMarkers.children().length === 0) {
                for (var i = 0; i <= 10; i++) {
                    var marker = $('<span>').text(i);
                    sliderMarkers.append(marker);
                }
            }

            // Send pain metric to server when it changes
            $('#pain_metric').on('input', function() {
                $.ajax({
                    type: 'POST',
                    url: '/submit',
                    data: {pain_metric: $('#pain_metric').val()},
                    success: function(response) {
                        console.log('Data submitted successfully:', response);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                       console.log('Error submitting data:', textStatus, errorThrown, 'Server response:', jqXHR.responseText);
                    }
                });
            });
        });
        function createAnnotation(annotation) {
            $.ajax({
                type: 'POST',
                url: '/create_annotation',
                data: {annotation: annotation},
                success: function(response) {
                    console.log('Annotation created successfully:', response);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('Error creating annotation:', textStatus, errorThrown, 'Server response:', jqXHR.responseText);
                }
            });
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

@app.route("/")
def index():
    return render_template_string(index_html)

@app.route("/submit", methods=["POST"])
def submit():
    pain_metric = request.form.get("pain_metric", type=int)
    print(f"Received pain_metric: {pain_metric}")

    json_body = [
        {
            "measurement": "cluster_headache",
            "tags": {
                "subject": "Oli"
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
        return "Data submitted successfully", 200
    except Exception as e:
        return f"Error submitting data: {e}", 500

@app.route("/create_annotation", methods=["POST"])
def create_annotation():
    annotation = request.form.get("annotation")

    headers = {
        "Authorization": f"Bearer {config['grafana']['api_key']}",
        "Content-Type": "application/json"
    }

    data = {
        "time": int(time.time() * 1000),
        "text": annotation,
        "tags": ["treatment"]
    }

    response = requests.post(f"{config['grafana']['url']}/api/annotations", headers=headers, json=data)

    if response.status_code == 200:
        return "Annotation created successfully", 200
    else:
        return f"Error creating annotation: {response.text}", 500

if __name__ == "__main__":
    app.run(debug=True)