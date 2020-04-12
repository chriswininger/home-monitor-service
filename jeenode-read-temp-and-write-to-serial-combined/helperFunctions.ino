#include "avr/sleep.h"

void mySleep(long delayMS) {
  setPrescaler(6); // prescaler 64
  long limit = millis() + delayMS/64;
  while (millis() < limit) {
    set_sleep_mode(SLEEP_MODE_IDLE);
    sleep_mode();
  }

  setPrescaler(0); // prescaler off
}

void setPrescaler (uint8_t mode) {
  cli();
  CLKPR = bit(CLKPCE);
  CLKPR = mode;
  sei();
}
