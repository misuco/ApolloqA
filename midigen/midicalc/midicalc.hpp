/**
 * Antarctica
 *
 * Piano music composition generator
 *
 * (c) 2022 by claudio zopfi
 *
 * Licence: GNU/GPL
 *
 * https://github.com/misuco/antarctica
 *
 */

#ifndef MIDICALC_HPP
#define MIDICALC_HPP

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

class Midicalc {

public:
    struct BlockConfig {
        int block;
        int transpose;
        int tempo;
        int note;
        int scale;
        int sound;
    };

    Midicalc();
    ~Midicalc() {}

    void    loadChordMap(string filename);
    void    loadScaleMap(string filename);
    void    loadMidiFile(const string &filename);
    void    analyzeMidiFile ();

    void    setBPM(int b );
    void    setCluster(int c );
    void    setQuarter(int q );
    void    setRepeat(int n);
    void    setTranspose(int n);

    void    initScaleFilter(int scale, int basenote);
    void    newMidiFile (vector<BlockConfig> blockConfigs);
    void    saveNewMidiFile(const string &filename);

private:

    MidiFile    midiIn;
    MidiFile    midiOut;
    MidiFile    midiOutLoop;
    int         ticksPerQuarterNote;

    // parameters
    int bpm;

    int fromQuarter;
    int toQuarter;
    int fromIndex;
    int toIndex;
    int origBpm;

    int repeat;
    int transpose;

    // control
    MidiEvent tempoEvent;
    double  currentTempo = 60.0;

    struct Block {
        int quarterBegin;
        int quarterEnd;
        int iBegin;
        int iEnd;
        double tempoInit;
        double tempoMin;
        double tempoMax;
        int nNoteOn;
        int nNoteOff;
        int nEventTempo;
        int nEventOther;
        int totalOn;
        map<int,int> notes;
        map<int,map<int,int>> harmonicMap;
    };

    vector<Block> blocks;
    vector<Block> clusters;

    map<string,string> chordMap;

    vector<string> scalePool;
    map<string,string> scaleMap;

    vector<bool> scaleFilter;
    vector<int> scaleFilterMap;
    int scaleFilterLowestNote;
    int scaleFilterHighestNote;

    //vector<int> endIndicies;
    //vector<int> blockQuarter;


    // function declarations:
    double  getTempo(int index);
    int     filterKey(int key);
    double  setTempo(double factor);

    void harmonicAnalyze(Block b);
    string midinote2txt(int note);
    string step2txt(int step);
    string triplet2txt(vector<int> tripletSteps, vector<int> triplets);
    string interval2txt( int i );

    string outputPath;
    void disassembleChord(map<int, int> pressedKeys);
};

#endif // MIDICALC_HPP
