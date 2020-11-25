Live Cam
==========

This module captures information about the pi/web cam solution I am using for remote monitoring. There is a not a lot
of code involved, but this README will serve to document the setup and the module will contain any related scripts.

### Setup: ###

* Motion (4.0) is installed
    * Motion exposes a web service on ports 8080 and 8081 which live stream the attached camera, currently in our
      chicken run :-)

* The configuration files are: /etc/motion/motion.conf and `/etc/default/motion`

* Images captured based on motion detect are stored at `/var/lib/motion`

* The script periodically moves images captures to s3

* git is installed to make it simple to copy this README to the pis home folder and update any support scripts I use

* To get logs from cron tasks you'll need to `sudo apt-get install postfix`

    * https://cronitor.io/cron-reference/no-mta-installed-discarding-output
    
    * to see the output you can `tail -f /var/mail/root`
    * also check `/var/logs/syslog`

* Sample cron entry: `*/15 * * * * AWS_ACCESS_KEY_ID=XXX AWS_ACCESS_KEY_SECRET=XXX /usr/local/bin/node /home/pi/live-cam/scripts/transfer-images-to-s3/transfer-images-to-s3.js /var/lib/motion --delete`

### transfer-images-to-s3

This command takes a path to a directory for upload. There is an optional delete flag which deletes files locally once
uploaded. Be careful with --delete when testing.

This script is configured as chron task on the pi and passes the delete flag

The script requires node v14.x

* The following environment values need to be set:
    * AWS_ACCESS_KEY_ID
    * AWS_ACCESS_KEY_SECRET

* An s3 bucket exists called `coop-cam-uploads`

### dl.sh

This is placed on the home folder of the pi and can be used to grab the latest copies of all the scripts and files here

When ran it will create a symlink to this readme in the home folder

### resources: ###

* https://tutorials-raspberrypi.com/raspberry-pi-security-camera-livestream-setup/

* http://lavrsen.dk/foswiki/bin/view/Motion/WebHome

* https://motion-project.github.io/


### Installing node v14.x on an older pi

nvm install is super super slow (you have to max out the swap and it's been running for days)

binaries are no longer produced for this version of arm "officially"  but can be found here:

`wget https://unofficial-builds.nodejs.org/download/release/v14.10.0/node-v14.10.0-linux-armv6l.tar.gz`

thx to: https://gist.github.com/davps/6c6e0ba59d023a9e3963cea4ad0fb516
