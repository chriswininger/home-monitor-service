Live Cam
==========

This module captures information about the pi/web cam solution I am using for remote monitoring. There is a not a lot
of code involved, but this README will serve to document the setup and the module will contain any related scripts.

### Setup: ###

* Motion (4.0) is installed
    * Motion exposes a web service on ports 8080 and 8081 which live stream the attached camera, currently in our
      chicken run :-)

* The configuration files are: /etc/motion/motion.conf and /etc/default/motion

* Images captured based on motion detect are stored at /var/lib/motion

* The script periodically moves images captures to s3

### transfer-images-to-s3

This command takes a path to a directory for upload. There is an optional delete flag which deletes files locally once
uploaded. Be careful with --delete when testing.

This script is configured as chron task on the pi and passes the delete flag

The script requires node v14.x

* The following environment values need to be set:
    * AWS_ACCESS_KEY_ID
    * AWS_ACCESS_KEY_SECRET

* An s3 bucket exists called `coop-cam-uploads`

### resources: ###

* https://tutorials-raspberrypi.com/raspberry-pi-security-camera-livestream-setup/

* http://lavrsen.dk/foswiki/bin/view/Motion/WebHome

* https://motion-project.github.io/
 