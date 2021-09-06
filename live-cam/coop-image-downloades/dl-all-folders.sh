#!/bin/bash

base_path=s3://coop-cam-uploads

aws s3 ls "$base_path" |
  grep 'PRE ' |
  while read line ;
  do
    directory=${line#"PRE "}
    directory=${directory%"/"}

    ./dl-folder.sh "$directory"
  done

