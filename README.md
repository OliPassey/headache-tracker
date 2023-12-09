# headache-tracker
A tracking solution for Cluster Headache Sufferers  
I often under report my headaches due to the nature of the condition, this app aims to increase accuracy and server as a companion app for patients and carers alike. I aim to add export features so data can easily be taken to medical appointments.

## Install  
- Install XAMPP or another PHP Enabled WebServer
- Download / Clone this repo into a cluster folder within the webserver (c:\xampp\htdocs\clusters\ for example)
- Download & Install Composer https://getcomposer.org/download/ 
- Using Windows Terminal (or other command line tool) navigate to the extracted directory and run "composer install" (no quotes)
- Download & Install MongoDB https://www.mongodb.com/try/download/community
- Check the web-browser is started and running, navigate to http://localhost/clusters/

## Docker
Although published on my docker hub, the app does not function correctly under docker at this time. I am working to resolve this asap.

## Current Requirements
Web Server with PHP 8.1  
MongoDB  
Caddy (Reverse Proxy)  
(Moving to docker compose file shortly)  

## Configuration
The app is designed to be configured on first use, it will guide you through a setup process and ask for patient details to customize the experience.  

## Screenshots
Pain Logging Screen:
![image](https://github.com/OliPassey/headache-tracker/assets/7745805/61869567-1f71-4434-93ec-0f561a7c9561)

Report View:
![image](https://github.com/OliPassey/headache-tracker/assets/7745805/cd3ab318-5d06-4cab-80f0-13280a189f1f)

List View:  
![image](https://github.com/OliPassey/headache-tracker/assets/7745805/0ad4d94c-81e4-4d9c-90b8-ae0e5ee68ca7)
