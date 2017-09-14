#!/bin/bash
mkdir db
mkdir log
forever start scrapping.js
echo 'If you want to stop forever stop scrapping.js'

