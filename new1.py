from flask import Flask, request, render_template, jsonify
from influxdb import InfluxDBClient
import json
import requests
import time

app = Flask(__name__)

# Load configuration
try:
    with open("config.json") as f:
        config = json.load(f)
except Exception as e:
    print(f"Error loading configuration: {e}")
    exit(1)

subject = config.get('subject', 'DefaultSubject')

# Create a single InfluxDB client connection
client = InfluxDBClient(host=config['influxdb']['host'], port=config['influxdb']['port'], 
                        username=config['influxdb']['username'], password=config['influxdb']['password'])
client.switch_database(config['influxdb']['database'])

current_metric = 0
last_annotation = ''

@app.route("/")
def index():
    grafana_url = config.get('grafana', {}).get('pub_url', '#')
    return render_template('index.html', current_metric=current_metric, last_annotation=last_annotation, grafana_url=grafana_url)

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
    