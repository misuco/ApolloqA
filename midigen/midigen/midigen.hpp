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

    // Scale filter functions
    void    loadScaleMap(string filename);
    void    initScaleFilter(int scale, int basenote);

    //void    setBasenote(int b);
    //void    setScale(int s);
    void    setBPM(int b );
    void    setMode(int m);
    void    addInstrument(int i);
    void    addChord(string c);
    void    setSoundfont(string p);
    void    newMidiFile();
    void    saveNewMidiFile(const string &filename);

private:
    MidiFile    midiOut;
    
    vector<string> scalePool;
    map<string,string> scaleMap;
    vector<bool> scaleFilter;
    vector<int> scaleFilterMap;
    int scaleFilterLowestNote;
    int scaleFilterHighestNote;
    
    string soundfont;
    std::vector<int> _instruments;
    std::vector<string> _chords;
    //int         basenote;
    //int         scale;
    int         _mode;
    int         _bpm;
    int         _sampleRate;
    int         _nBeats;
    int         _quantize;
    int         depth;
    int         octaveLow;
    int         octaveHigh;
    int         _tpq = 48;         // default value in MIDI file is 48
    int         _tp16th = _tpq/4;  // tiks per 16th note
    
    int  filterKey(int key);
    void createRandomTrack();
    void createDrumTrack();
    void createBassTrack();
    void createChordsTrack();
    int str2midinote(string note);
    string midinote2txt(int note);
};

#endif // MIDIGEN_HPP
