/**
 * Midigen
 *
 * Midi music generator
 *
 * (c) 2025 by claudio zopfi
 *
 * Licence: GNU/GPL
 *
 * https://github.com/misuco/antarctica
 *
 */

#ifndef MIDIGEN_HPP
#define MIDIGEN_HPP

#include "MidiFile.h"
#include "Options.h"

#include <map>
#include <ctype.h>
#include <string.h>
#include <stdio.h>
#include <iostream>
#include <vector>

using namespace std;
using namespace smf;

class Midigen {

public:

    Midigen();
    ~Midigen() {}

    void    setBPM(int b );
    void    setMode(int m);
    void    newMidiFile ();
    void    saveNewMidiFile(const string &filename);

private:
    MidiFile    midiOut;
    int         mode;
    int         bpm;
    int         sampleRate;
    int         nBeats;
    int         tpq = 48;               // default value in MIDI file is 48
    int         tp16th = tpq/4;         // tiks per 16th note
    
    void createRandomTrack();
    void createDrumTrack();
    void createBassTrack();
};

#endif // MIDIGEN_HPP
