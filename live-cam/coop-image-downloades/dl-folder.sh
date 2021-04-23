#!/bin/bash

base_path=s3://coop-cam-uploads
folder=$1

aws s3 cp "$base_path/$folder" "./$folder" --recursive
aws s3 rm "$base_path/$folder" --recursive

