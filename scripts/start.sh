#!/bin/bash

# this start file can be placed in the home directory on a pi and used to launch the stack

serial_monitor_dir=/home/pi/home-monitor-service/serial-monitor

display_server=/home/pi/home-monitor-service/temperature-display

display_server_log_path=/home/pi/display-server.log
display_server_error_log_path=/home/pi/display-server-error.log

serial_monitor_log_path=/home/pi/serial-monitor.log
serial_monitor_error_log_path=/home/pi/serial-monitor-error.log


touch $display_server_log_path


pushd $serial_monitor_dir > /dev/null
(node ./index.js >> $serial_monitor_log_path 2>>$serial_monitor_error_log_path &)
popd > /dev/null

pushd $display_server > /dev/null
(npm run start >> $display_server_log_path 2>>$display_server_error_log_path &)
popd > /dev/null

# pause for a bit while the servers start (25 secons)
sleep 25

chromium-browser http://localhost:3000

# chromium-browser --disable-infobars --disable-session-crashed-bubble --kiosk http://localhost:3000
