#!/bin/bash
mkdir db
mkdir log
export DISPLAY=:0.0
forever start scrapping.js
echo 'If you want to stop $forever stop 0'

