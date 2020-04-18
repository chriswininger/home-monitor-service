/*
 * RF12RadioToSerial
 * Author: Chris Wininger
 * Description: Intended for use with the JeeNode V6, this application listens for packets
 *  from another JeeNode which contain a single a float value representing the temperature
 *  in celsius. This data is converted to json containing the temperature in farenheit and
 *  sent over the serail port to a computer which has listening software waiting to receive it
 */
#include <JeeLib.h>
#include <RF12sio.h>

#define SET_NODE          22     // wireless node ID 
#define SET_GROUP         210    // wireless net group 
#define SEND_MODE         2     // set to 3 if fuses are e=06/h=DE/l=CE, else set to 2
#define FILTERSETTLETIME  5000 //  Time (ms) to allow the filters to settle before sending data
#define NODE_TO_WATCH     3
#define MAJOR_VERSION     RF12_EEPROM_VERSION

boolean settled = false;

// struct must match the struct defined in our sender sketch (JeeNodeV6TemperatureBroadcasterDS1820B)
typedef struct {
  float tempDS1820B;
} Payload;
Payload data;

void setup() {
  rf12_initialize(SET_NODE, RF12_433MHZ, SET_GROUP);
  Serial.begin(57600);
  Serial.print("Initializing");
}

void loop() {
  // check if we have a message ready from the rf12 board
  if (rf12_recvDone()) {
    byte n = rf12_len;

    // check that we got the entire packet no errors
    if (rf12_crc == 0 && (rf12_hdr & RF12_HDR_CTL) == 0) {
      int nodeID = (rf12_hdr & 0x1F);

      if (nodeID == NODE_TO_WATCH) {
        // use the pointer for our byte array and cast it to our struct
        data = *(Payload*)rf12_data;

        // convert to farenheit and send to serail port
        float tempFarenheit = celsiusToFarenheit(data.tempDS1820B);
        writeData(tempFarenheit);
      }
    }
  }  
}

void writeData(float temp) {
  Serial.print("{\"temperature\": \"");
  Serial.print(temp);
  Serial.print("\"}");
  Serial.println("");
}

float celsiusToFarenheit(float c) {
  return c * 1.8 + 32.0;
}
