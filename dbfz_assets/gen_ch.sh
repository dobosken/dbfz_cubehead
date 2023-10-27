#!/bin/bash

# This is the script I use to generate the txt cubeheads
# Might as well put it somewhere in this repository

font="DBZ_0_Default.otf"

# init
cd "${0%/*}"
if ! command -v convert &> /dev/null; then
    echo "ImageMagick could not be found."
    exit 127
fi

while true; do
    read -p "Text: " txt
    convert -background black -fill transparent -font "${font}" -size 1968x512 -gravity center LABEL:"${txt}" \
    -background black -gravity northwest -splice 40x0 \
    -background black -gravity northeast -splice 40x0 \
    -background none -gravity center -extent 3072x512 cubehead.png
done
