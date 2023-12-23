#!/bin/bash

rm -f all.js
for f in utils contentData layout navigation background menu logo letter media about news music player donation streetlights wetlands; do
    cat ../js/$f.js >> all.js;
done
uglifyjs all.js -o all.min.js -c -m
