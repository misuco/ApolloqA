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

#include "midigen.hpp"
#include <sstream>
#include <stdlib.h>
#include <stdexcept> // exec
#include <algorithm> // rtrim
#include <random>

std::string exec(const char* cmd) {
    char buffer[128];
    std::string result = "";
    FILE* pipe = popen(cmd, "r");
    if (!pipe) throw std::runtime_error("popen() failed!");
    try {
        while (fgets(buffer, sizeof buffer, pipe) != NULL) {
            result += buffer;
        }
    } catch (...) {
        pclose(pipe);
        throw;
    }
    pclose(pipe);
    return result;
}

// Trim from the end (in place)
inline void rtrim(std::string &s) {
    s.erase(std::find_if(s.rbegin(), s.rend(), [](unsigned char ch) {
        return !std::isspace(ch);
    }).base(), s.end());
}

void Midigen::setBPM(int b)
{
    bpm = b;
}

void Midigen::setMode(int m)
{
    mode = m;
}

//////////////////////////////
//
// convertMidiFileToText --
//

Midigen::Midigen() :
    bpm { 125 },
    sampleRate {48000},
    nBeats {4},
    mode {0}
{
    //QDir d;
    //d.mkdir(outputPath+"wav");
    //d.mkdir(outputPath+"mid");
}

void Midigen::newMidiFile() {

    MidiEvent tempoEvent;
    
    vector<uchar> midievent;    // temporary storage for MIDI events
    midievent.resize(3);        // set the size of the array to 3 bytes

    midiOut.clear();
    midiOut.absoluteTicks();    // time information stored as absolute time
                                // (will be coverted to delta time when written)
    midiOut.addTrack(2);        // Add another two tracks to the MIDI file
    midiOut.setTicksPerQuarterNote(tpq);

    //tempoEvent.makeTempo(bpm);
    tempoEvent.setTempo(bpm);
    //tempoEvent.tick = 0;
    midiOut.addEvent( 0, 0, tempoEvent );
    
    if(mode==1) {
        createDrumTrack();
    } else {
        createRandomTrack();        
    }
    
    // End Of Track
    int endtick=nBeats*tpq;
    midiOut.addMetaEvent( 0, endtick, 0x2F, "" );
    midiOut.addCopyright( 0, 0, "c1audio 2025" );
    midiOut.sortTracks();

}

void Midigen::createRandomTrack() {
    // Random Track
    std::random_device dev;
    std::mt19937 rng(dev());
    std::uniform_int_distribution<std::mt19937::result_type> dist127(0,127); // distribution in range [1, 6]

    int randomInstrument = dist127(rng);
    
    MidiEvent pc( 192, randomInstrument );
    midiOut.addEvent( 1, 0, pc );

    // number of 16th notes to generate
    int n16th=nBeats*4;
    for(int i=0;i<n16th;i++) {
        
        int tick=i*tp16th+1;
        MidiEvent midievent;
        int randomNote = dist127(rng);
        int randomVelocity = dist127(rng);

        midievent.setCommand(0x90,randomNote,randomVelocity);
        midiOut.addEvent( 0, tick, midievent );

        midievent.setCommand(0x80,randomNote,0x00);
        midiOut.addEvent( 0, tick+tpq/8, midievent );
    }
}

void Midigen::createDrumTrack() {
    // Drum Track

    /*
    Program change to 42 on channel 1-16
    
    for(int i=192;i<192+16;i++) {
        MidiEvent pc( i, 41 );
        midiOut.addEvent( 0, 0, pc );
    }
    */

    // number of 16th notes to generate
    int n16th=nBeats*4;
    for(int i=0;i<n16th;i++) {
        
        int tick=i*tp16th;
        MidiEvent midievent;

        int beat=i%8;
        for(int note:{0x2A,0x24,0x26}) {
            bool addEvent=false;
            if(note==0x2A) { // HiHat
                addEvent=true;
            } else if(note==0x24) { // Bassdrum
                if(beat==0 || beat==4) {
                    addEvent=true;
                }
            } else if(note==0x26) { // Snare
                if(beat==4) {
                    addEvent=true;
                }
            }
            if(addEvent) {
                midievent.setCommand(0x99,note,0x7f);
                midiOut.addEvent( 0, tick, midievent );

                midievent.setCommand(0x89,note,0x00);
                midiOut.addEvent( 0, tick+tpq/8, midievent );
            }
        }
    }
}


void Midigen::createBassTrack() {
    // Bass Track
    MidiEvent pc( 192, 38 );
    midiOut.addEvent( 1, 0, pc );
    for(int i=0;i<16;i++) {

        int tick=i*tpq/4;
        MidiEvent midievent;

        int beat=i%8;

        if(beat==2 || beat==6 || beat==3 || beat==7) {
            int note=0x25;
            midievent.setCommand(0x90,note,0x7f);
            midiOut.addEvent( 1, tick, midievent );

            midievent.setCommand(0x80,note,0x00);
            midiOut.addEvent( 1, tick+tpq/4-2, midievent );
        }
    }
}

void Midigen::saveNewMidiFile(const string &filename)
{
    midiOut.write(filename+".mid");
    string soundfont = "/home/antarctica/antarcticalibs/Touhou.sf2";
    string command = "fluidsynth -v " + soundfont + " " + filename + ".mid -F " + filename + "-uncut.wav -r 48000 -O s24";
    system( command.c_str() );
    cout << "executed " << command << endl;
    
    int nSamples=60*sampleRate*nBeats/bpm;
    string nSamplesIsCommand="soxi -s "+ filename + "-uncut.wav ";
    string nSamplesIs=exec( nSamplesIsCommand.c_str() );
    rtrim(nSamplesIs);
    cout << "samples: " << nSamplesIs << endl;
    string nSamplesPad=to_string(nSamples - stoi(nSamplesIs));
    
    //command = "sox " + filename + "-uncut.wav " + filename + ".wav " + " trim 0 " + "" + nSamples + "s"; //
    command = "sox " + filename + "-uncut.wav " + filename + ".wav " + " pad " + nSamplesPad + "s@" + nSamplesIs + "s"; //
    system( command.c_str() );
    cout << "executed " << command << endl;
    
    command = "ffmpeg -y -i " + filename + ".wav -acodec mp3 -ab 128k " + filename + ".mp3";
    system( command.c_str() );
    cout << "executed " << command << endl;
    
    //command = "rm " + filename + "-loop.wav";
    //system( command.c_str() );

    //cout << "saved " << filename << endl;
}

