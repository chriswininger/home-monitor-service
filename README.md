# home-monitor-service
service to expose sensors in the home via Alexa

### Architecture
This service comprises 7 applications:
1. JeeNodeV6TemperatureBroadcasterDS1820B: Runs on a JeeNode (V6) and reads the temperature from a DS1820B digital sensor. It then transmits the data at 433mhz using an RF12 chip.
2. RF12RadioToSerial: Runs on a JeeNode (v6). It listens at 433mhz for packets from the JeeNode running "JeeNodeV6TemperatureBroadcasterDS1820B". When it receives packets from the correct node id it converts them to json and sends them over the serial port to an internet connected device for transmission to lambda
3. serial-monitor: Runs on the computer with the attached JeeNode and proxies data to the AWS lambda defined in home-monitor-service-log-temp
4. home-monitor-service-log-temp: A lambda function deployed to AWS which receives temperature data and persists it to a dynamo database
5. home-monitor-service-get-temp: A lambda function which retrieves temperature data from the dynamo database and exposes it to Alexa
6. An Alexa skill which is backed by the home-monitor-service-get-temp lambda
7. live-cam: A series of guides and configuration for converting a pi+webcam into a monitoring solution

### Use
The skill is named "house elf" and contains the intent "temperature" which can be invoked through `ask house elf what is the temperature`

![image of sensors](https://github.com/chriswininger/home-monitor-service/blob/master/assets/images/sensor_img1.jpg?raw=true)

![image of sensors](https://github.com/chriswininger/home-monitor-service/blob/master/assets/images/sensor_img2.jpg?raw=true)

### Building / Running

The jeelib boards can be programmed from the Arduino IDE.

* Target and Arduino Uno
* set the serial speed to 57600

### Parts

* JeeNode v2: https://moderndevice.com/product/jeenode-v6-kit/
* DS18B20 temperature sensor: https://www.adafruit.com/product/381

### Background Resources
* Alexa:

	* https://developer.amazon.com/alexa-skills-kit/tutorials?&sc_channel=SEM&sc_category=Paid&sc_content=Skill_Related&sc_funnel=Visit&sc_campaign=Evergreen&sc_segment=Devs&sc_publisher=GO&sc_country=US&sc_trackingcode=SEM01&sc_place=&sc_detail=234225542300&sc_keyword=writing%20an%20alexa%20skill&gclid=EAIaIQobChMIs_-F1vKt2gIVyLrACh11RgelEAAYASAAEgJ6DvD_BwE
	* https://developer.amazon.com/alexa/voice-design
	* https://developer.amazon.com/docs/devconsole/test-your-skill.html 

* Sensors:
	* https://wiki.openenergymonitor.org/index.php/RFM12Pi_V2

	* https://jeelabs.net/projects/jeelib/wiki/RF12demo

	* https://jeelabs.net/boards/7/topics/2603

	* https://github.com/jcw/jeelib/tree/master/examples/RF12/RF12demo

	* https://forum.jeelabs.net/node/638.html

	* https://lowpowerlab.com/forum/moteino/data-struct-for-sendingreceiving-(solved)/

	* https://github.com/openenergymonitor/learn/blob/master/view/electricity-monitoring/networking/sending-data-between-nodes-rfm.md
 
