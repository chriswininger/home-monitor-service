/*
 * RF12RadioToSerial
 * Author: Chris Wininger
 * Description: Intended for use with the JeeNode V6 and a DHT11 Huditity Sensor. This application take periodic humidity readings and broadcasts it to the base station
 */
#include <JeeLib.h>
#include <RF12sio.h>
#include <DHT.h>
#include <DHT_U.h>
#include "avr/sleep.h"
#define BATT_SENSE_PORT 2    // sense battery voltage on this port

#define DEBUG 1

#define SET_NODE          6     // wireless node ID 
#define SET_GROUP         210    // wireless net group 
#define SEND_MODE         2     // set to 3 if fuses are e=06/h=DE/l=CE, else set to 2
#define FILTERSETTLETIME  5000 //  Time (ms) to allow the filters to settle before sending data
#define MAJOR_VERSION     RF12_EEPROM_VERSION

// setup to read data (D) on Port 3 of jeenode (tranlates to pin 6 in arduino speak)
#define PD_PIN_NUM 6

#define DHTTYPE DHT11
DHT dht(PD_PIN_NUM, DHTTYPE);

long loopWaitMS = 5000; // 60000 * TRANSMIT_INTERVAL;

typedef struct {
  float temperature;
  float humidity;
} Payload;
Payload payload;

void setup() {
  Serial.begin(57600);

  
  Serial.println("Initializing RF12");
  rf12_initialize(SET_NODE, RF12_433MHZ, SET_GROUP);

  Serial.println("Initializing humidity sensor DHT11");
  dht.begin();
}


boolean settled = false;

void loop() {
  // put your main code here, to run repeatedly:
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float f = dht.readTemperature(true);

  if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  payload.temperature = f;
  payload.humidity = h;

  if (DEBUG) {
    Serial.print(F(" Humidity: "));
    Serial.print(payload.humidity);
    Serial.print(F("%  Temperature: "));
    Serial.print(payload.temperature);
    Serial.print("\n");
  }

  delay(100);

    // because millis() returns to zero after 50 days ! 
    if (!settled && millis() > FILTERSETTLETIME) {
      if (DEBUG) {
        Serial.println("Settled, begin broadcast");
      }
      settled = true;
    }

     if (settled) {
      send_rf_data(payload);

      // explicit delay to reduce power consumption
      mySleep(loopWaitMS);
    } else {
      delay(500);  
    }
}
