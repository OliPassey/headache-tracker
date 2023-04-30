# headache-tracker
![image](https://github.com/OliPassey/headache-tracker/blob/master/static/logo.png?raw=true)<br />
A tracking solution for Cluster Headache Sufferers

If you, like me, suffer from CH then you'll know first hand how difficult it can be to give reliable information to doctors about our pain, how long attacks lasted, how effective treatments are and how long it takes to feel normal again after an attack. I found I was heavily under reporting when I started logging, and so I built this app to help logging easier when in the middle of an attack.<br /> 
This is a work in progress, so be gentle!

You will need:<br />
A server / computer to run the python script on, that is web accessible.<br />
InfluxDB v1<br />
Grafana<br />

You will need to configure the InfluxDB Database, i use 'telegraf' as it already exists.
You must secure your influxdb server! Do not open it to the internet without understanding what you are doing!
Do not expose this app to the public internet, if you want remote access to it use a VPN.

![image](https://user-images.githubusercontent.com/7745805/235332290-121de31a-e84c-4e8e-af40-768782348316.png)
