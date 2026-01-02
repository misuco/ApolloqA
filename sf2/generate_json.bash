#!/bin/bash
IFS=$'\n'
COMMA=""
INVALID_BANKS=""
printf "[\n"
for sf2file in $(ls *.sf2); do
    if sf2dump $sf2file >/dev/null 2>&1; then 
    printf "$COMMA\n"
    printf "\t{\n"
    printf "\t\t\"name\":\"$sf2file\",\n"
    printf "\t\t\"soundfont\":\"$sf2file\",\n"
    printf '\t\t"presets":[\n'
    COMMA2=""
else
    INVALID_BANKS+="$sf2file *** "
    continue
fi
for presetNr in $(sf2dump $sf2file 2>&1 | grep Preset:); do
    printf "$COMMA2"
    echo $presetNr | awk '{split($0,a,/[\:,]|[(]Pres/);gsub(/[%"]/,"",a[1]);gsub(/^[ \t]+|[ \t]+$/,"",a[1]);gsub(/^[ \t]+|[ \t]+$/,"",a[3]);gsub(/^[ \t]+|[ \t]+$/,"",a[5]);printf "\t\t\t{\"name\":\""a[1]"\",\"nr\":\""a[3]"\",\"bank\":\""a[5]"\"}" }'
    COMMA2=",\n"
done
printf '\n\t\t]\n\t}'
COMMA=","
done
printf "\n]\n"
unset IFS
