#!/bin/bash

base_path=s3://coop-cam-uploads
folder=$1

echo "Downloading: $base_path/$folder}"
aws s3 cp "$base_path/$folder" "./$folder" --recursive

#echo "Deleting: $base_path/$folder"
#aws s3 rm "$base_path/$folder" --recursive
