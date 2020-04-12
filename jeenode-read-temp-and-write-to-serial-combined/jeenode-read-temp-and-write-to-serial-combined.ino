#include <JeeLib.h>
#include <RF12sio.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "avr/sleep.h"

#define VERSION "0.0.1"
#define APP_NAME "JEENODE READ TEMP AND WRITE TO SERIAL"
#define SENSOR_NAME "Chicken Coop"

#define DEBUG 1

#define TRANSMIT_INTERVAL 1 // interval in minutes

#define FILTERSETTLETIME 5000
#define ONE_WIRE_BUS 4

#define SET_NODE 5 // Node ID for chicken coop

#define SET_GROUP 210    // wireless net group
#define FILTERSETTLETIME 5000 //  Time (ms) to allow the filters to settle before sending data

boolean settled = false;
long loopWaitMS = 60000 * TRANSMIT_INTERVAL;

// setup to read sensor data on Port1 D
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// define structure rf12 packets
typedef struct { float tempDS1820B; } Payload;

Payload payload;

void setup() {
  Serial.begin(57600);


  Serial.println();
  Serial.print(APP_NAME);
  Serial.print(" -- v");
  Serial.print(VERSION);
  Serial.println();

  // initialize the RFM12B for wireless transmission
  rf12_initialize(SET_NODE, RF12_433MHZ, SET_GROUP);
  rf12_sleep(RF12_SLEEP);
 
  // initialize temperature sensor library
  sensors.begin();
}

void loop() {
    // read the current temperature from the DS1820B sensor
    sensors.requestTemperatures();
 
    payload.tempDS1820B = sensors.getTempCByIndex(0);

    Serial.println();
    Serial.print("{\"temperature\": \"");
    Serial.print(payload.tempDS1820B);
    Serial.print("\"");
    Serial.print(", \"sensor\": \"");
    Serial.print(SENSOR_NAME);
    Serial.print("\"");
    Serial.print("}");
    Serial.println("");


    delay(1000); // wait for all serial data to be sent
    Serial.flush();
    mySleep(500);
}
