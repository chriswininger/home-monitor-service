# home-monitor-service
service to expose sensors in the home via Alexa

### Architecture
This service is comprised of 5 applications:
1. DS1820B_Simple_Read: Runs on a JeeNode (v6) and transmits temperature data over the serial port to a computer in the home
2. serial-monitor: Runs on the computer with the attached JeeNode and proxies data to the AWS lambda defined in home-monitor-service-log-temp
3. home-monitor-service-log-temp: A lambda function deployed to AWS which receives temperature data and persists it to a dynamo database
4. home-monitor-service-get-temp: A lambda function which retrieves temperature data from the dynamo database and exposes it to Alexa
5. An Alexa skill which is backed by the home-monitor-service-get-temp lambda

### Use
The skill is named "house elf" and contains the intent "temperature" which can be invoked through `ask house elf what is the temperature`

![image of sensors](https://github.com/chriswininger/home-monitor-service/blob/master/assets/images/sensor_img1.jpg?raw=true)

### Background Resources
* https://wiki.openenergymonitor.org/index.php/RFM12Pi_V2

* https://jeelabs.net/projects/jeelib/wiki/RF12demo

* https://jeelabs.net/boards/7/topics/2603

* https://github.com/jcw/jeelib/tree/master/examples/RF12/RF12demo

* https://forum.jeelabs.net/node/638.html

* https://lowpowerlab.com/forum/moteino/data-struct-for-sendingreceiving-(solved)/

* https://github.com/openenergymonitor/learn/blob/master/view/electricity-monitoring/networking/sending-data-between-nodes-rfm.md
 
