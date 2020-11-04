# JeeNode Read Temp and Write To Serial Combined

This will be ran on a JeeNode V6 connected to a computer over the USB port.

Together this makes the base station.

The sketch will read a temperature from the attached sensor as well as read temperatures that are being broadcast from
other jeennodes.

All temperatures will be printed over serial in a json format suitable for reading by the serial-monitor project
