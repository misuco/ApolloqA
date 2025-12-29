#!/bin/bash
IFS=$'\n'
COMMA=""
printf "[\n"
for sf2file in $(ls *.sf2); do
    printf "$COMMA\n"
    printf "\t{\n"
    printf "\t\t\"name\":\"$sf2file\",\n"
    printf "\t\t\"soundfont\":\"$sf2file\",\n"
    printf '\t\t"program":['
    COMMA2=""
    for presetNr in $(sf2dump $sf2file 2>&1 | grep "Bank: 0" | grep Preset:); do
        printf "$COMMA2"
        echo $presetNr | awk '{split($0,a,"\(Preset: "); split(a[2],b,","); printf b[1]}';
        COMMA2=","
    done
    printf ']\n\t}'
    COMMA=","
done
printf "\n]\n"
unset IFS
