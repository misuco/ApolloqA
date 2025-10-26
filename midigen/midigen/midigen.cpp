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
    _bpm = b;
}

void Midigen::setMode(int m)
{
    _mode = m;
}

void Midigen::addInstrument(int i) {
    _instruments.push_back(i);
}

void Midigen::addChord(string c) {
    _chords.push_back(c);
}

void Midigen::setSoundfont(string p)
{
    soundfont = p;
}

//////////////////////////////
//
// convertMidiFileToText --
//

Midigen::Midigen() :
    _mode {0},
    _bpm {125},
    _sampleRate {48000},
    _nBeats {4},
    soundfont {"/home/apolloqa/sf2/Touhou.sf2"}
{
}

void Midigen::loadScaleMap(string filename)
{
    ifstream file(filename);
    string line;

    if(!file.is_open()) return;

    //ommit first line in csv file
    getline(file,line);
    
    while(getline(file,line)) {
        vector<string> fields;// = line.split(";");
        istringstream f(line);
        string s;
        while (getline(f, s, ';')) {
            //cout << s << endl;
            fields.push_back(s);
        }

        if(fields.size()>2) {
            scaleMap[fields.at(2)] = fields.at(0);
            scalePool.push_back(fields.at(2));
            //cout << "loaded chord " << fields.at(0) << endl;
        } else {
            //cout << "invalid record " << line << endl;
        }
    }

}

void Midigen::initScaleFilter(int scale, int basenote)
{
    if(scale>=scalePool.size()) scale=scalePool.size()-1;

    cout << "Scale: " << scaleMap[scalePool.at(scale)] << endl;
    cout << "Basenote: " << midinote2txt(basenote) << endl;

    // clear existing filter
    scaleFilter.clear();
    scaleFilterMap.clear();
    for(int i=0;i<127;i++) {
        scaleFilter.push_back( false );
        scaleFilterMap.push_back( -1 );
    }

    // seek lowest hearable note
    scaleFilterLowestNote = basenote;
    while(scaleFilterLowestNote<21) { scaleFilterLowestNote+=12; }

    // get record
    vector<string> scaleSteps;
    istringstream f(scalePool.at(scale));
    string s;
    while (getline(f, s, '-')) {
        //cout << s << endl;
        scaleSteps.push_back(s);
    }

    int stepI = 0;
    for(int i=scaleFilterLowestNote;i<127;) {
        scaleFilter.at(i)=true;
        scaleFilterHighestNote=i;

        if(scaleSteps.size()==0) {
            i+=12;
        } else if(scaleSteps.at(stepI)=="H") {
            i+=1;
        } else if(scaleSteps.at(stepI)=="W") {
            i+=2;
        } else if(scaleSteps.at(stepI)=="2W") {
            i+=4;
        } else if(scaleSteps.at(stepI)=="3H") {
            i+=3;
        } else if(scaleSteps.at(stepI)=="4H") {
            i+=4;
        } else {
            cout << "WARNING: unknown step token " << scaleSteps.at(stepI) << endl;
        }
        stepI++;
        if(stepI>=scaleSteps.size()) {
            stepI=0;
        }
    }
}

void Midigen::newMidiFile() {

    MidiEvent tempoEvent;
    
    vector<uchar> midievent;    // temporary storage for MIDI events
    midievent.resize(3);        // set the size of the array to 3 bytes

    midiOut.clear();
    midiOut.absoluteTicks();    // time information stored as absolute time
                                // (will be coverted to delta time when written)
    midiOut.addTrack(2);        // Add another two tracks to the MIDI file
    midiOut.setTicksPerQuarterNote(_tpq);

    //tempoEvent.makeTempo(_bpm);
    tempoEvent.setTempo(_bpm);
    //tempoEvent.tick = 0;
    midiOut.addEvent( 0, 0, tempoEvent );
    
    if(_mode==1) {
        createDrumTrack();
    } else {
        createChordsTrack();
        //createRandomTrack();
    }
    
    // End Of Track
    int endtick=_nBeats*_tpq;
    midiOut.addMetaEvent( 0, endtick, 0x2F, "" );
    midiOut.addCopyright( 0, 0, "c1audio 2025" );
    midiOut.sortTracks();

}

int Midigen::filterKey(int key) {

    if(key>=scaleFilterHighestNote) {
        return scaleFilterHighestNote;
    } else if(key<=scaleFilterLowestNote) {
        return scaleFilterLowestNote;
    } else if(scaleFilterMap[key] == -1) {
        int mapKeyUp=key;
        int mapKeyDown=key;

        while(scaleFilter.at(mapKeyDown)!=true && scaleFilter.at(mapKeyUp)!=true ) {
            mapKeyDown--;
            mapKeyUp++;
        }
        if( scaleFilter.at(mapKeyUp)==true) {
            scaleFilterMap[key] = mapKeyUp;
        } else if( scaleFilter.at(mapKeyDown)==true ) {
            scaleFilterMap[key] = mapKeyDown;
        }
    }
    return scaleFilterMap[key];
}

void Midigen::createRandomTrack() {
    // Random Track
    std::random_device dev;
    std::mt19937 rng(dev());
    std::uniform_int_distribution<std::mt19937::result_type> dist127(0,127); // distribution in range [1, 6]

    int randomInstrument = dist127(rng);
    randomInstrument=(randomInstrument%16*5);
    
    MidiEvent pc( 192, randomInstrument );
    midiOut.addEvent( 1, 0, pc );

    // number of 16th notes to generate
    int n16th=_nBeats*4;
    for(int i=0;i<n16th;i++) {
        
        int tick=i*_tp16th+1;
        MidiEvent midievent;
        int randomNote = filterKey(dist127(rng));
        int randomVelocity = dist127(rng);

        midievent.setCommand(0x90,randomNote,randomVelocity);
        midiOut.addEvent( 0, tick, midievent );

        midievent.setCommand(0x80,randomNote,0x00);
        midiOut.addEvent( 0, tick+_tpq/8, midievent );
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
    int n16th=_nBeats*4;
    for(int i=0;i<n16th;i++) {
        
        int tick=i*_tp16th;
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
                midiOut.addEvent( 0, tick+_tpq/8, midievent );
            }
        }
    }
}


void Midigen::createBassTrack() {
    // Bass Track
    MidiEvent pc( 192, 38 );
    midiOut.addEvent( 1, 0, pc );
    for(int i=0;i<16;i++) {

        int tick=i*_tpq/4;
        MidiEvent midievent;

        int beat=i%8;

        if(beat==2 || beat==6 || beat==3 || beat==7) {
            int note=0x25;
            midievent.setCommand(0x90,note,0x7f);
            midiOut.addEvent( 1, tick, midievent );

            midievent.setCommand(0x80,note,0x00);
            midiOut.addEvent( 1, tick+_tpq/4-2, midievent );
        }
    }
}

void Midigen::createChordsTrack() {
    // Random Track
    std::random_device dev;
    std::mt19937 rng(dev());
    std::uniform_int_distribution<std::mt19937::result_type> dist127(0,127); // distribution in range [1, 6]
    std::uniform_int_distribution<std::mt19937::result_type> dist32k(0,32767); // distribution in range [1, 6]

    int nInst=_instruments.size();
    int randomInstrument = dist127(rng);
    randomInstrument=randomInstrument%(nInst-1);
    
    MidiEvent pc( 192, _instruments.at(randomInstrument) );
    midiOut.addEvent( 1, 0, pc );
    
    std::vector<int> chordNoteSet;
    
    int chordId=0;
    for(auto chord:_chords) {
        // number of 16th notes to generate
        int n16th=_nBeats*4;
        int startTick=chordId*n16th*_tp16th;
        
        chordNoteSet.clear();
        int chordBaseNote=str2midinote(chord);
        
        char lastChar=chord.back();

        for(int octave=2;octave<7;octave++) {
            if(lastChar=='m') {
                // minor chord
                chordNoteSet.push_back(chordBaseNote+12*octave);
                chordNoteSet.push_back(chordBaseNote+3+12*octave);
                chordNoteSet.push_back(chordBaseNote+7+12*octave);
            } else {
                // major chord
                chordNoteSet.push_back(chordBaseNote+12*octave);
                chordNoteSet.push_back(chordBaseNote+4+12*octave);
                chordNoteSet.push_back(chordBaseNote+7+12*octave);
            }
        }
        int noteSetSize=chordNoteSet.size();
        
        for(int i=0;i<n16th;i++) {
            int tick=startTick+(i*_tp16th);
            MidiEvent midievent;
            int randomNote = chordNoteSet.at(dist32k(rng)%noteSetSize);
            int randomVelocity = 64+(dist127(rng)%2)*63;

            midievent.setCommand(0x90,randomNote,randomVelocity);
            midiOut.addEvent( 0, tick, midievent );

            midievent.setCommand(0x80,randomNote,0x00);
            midiOut.addEvent( 0, tick+_tp16th/2, midievent );
        }
        chordId++;
    }
}

void Midigen::saveNewMidiFile(const string &filename)
{
    midiOut.write(filename+".mid");
    string command = "fluidsynth -v '" + soundfont + "' " + filename + ".mid -F " + filename + "-uncut.wav -r 48000 -O s24";
    system( command.c_str() );
    cout << "executed " << command << endl;

    int nChords=_chords.size();
    int nSamples=60*_sampleRate*_nBeats*nChords/_bpm;
    string nSamplesIsCommand="soxi -s "+ filename + "-uncut.wav ";
    string nSamplesIs=exec( nSamplesIsCommand.c_str() );
    rtrim(nSamplesIs);
    int padSamples=nSamples - stoi(nSamplesIs);
    
    cout << "bpms " << _bpm << " chords " << nChords << " samples: target " << nSamples << " is " << nSamplesIs << " pad " << padSamples << endl;
    
    if(padSamples<0) {
        int trimSamples=stoi(nSamplesIs) - nSamples;
        string nSamplesTrim=to_string(nSamples);
        //string nSamplesTrimFrom=to_string(nSamples);
        command = "sox " + filename + "-uncut.wav " + filename + ".wav " + " trim 0 " + nSamplesTrim + "s";
        //command = "sox " + filename + "-uncut.wav " + filename + ".wav " + " trim " + nSamplesTrimFrom + "s " + nSamplesTrim + "s";
        //command = "sox " + filename + "-uncut.wav " + filename + ".wav " + " pad 0s@" + nSamplesIs + "s";
        system( command.c_str() );
        cout << "executed " << command << endl;
    } else {
        string nSamplesPad=to_string(padSamples);
        command = "sox " + filename + "-uncut.wav " + filename + ".wav " + " pad " + nSamplesPad + "s@" + nSamplesIs + "s";
        system( command.c_str() );
        cout << "executed " << command << endl;
    }
    
    
    command = "ffmpeg -y -i " + filename + ".wav -acodec libvorbis -ab 128k " + filename + ".ogg";
    system( command.c_str() );
    cout << "executed " << command << endl;

    string nSamplesIsMP3Command="soxi -s "+ filename + ".ogg";
    string nSamplesIsMP3=exec( nSamplesIsMP3Command.c_str() );
    cout << "executed " << nSamplesIsMP3Command << endl;    
    cout << "samples mp3: " << nSamplesIsMP3 << endl;
    
    //command = "rm " + filename + "-loop.wav";
    //system( command.c_str() );

    //cout << "saved " << filename << endl;
}

int Midigen::str2midinote(string note) {
    string firstChar=note.substr(0,1);
    string secondChar=note.substr(1,1);
    int midinote=-1;
    if (firstChar=="C") {
        if (secondChar=="#") {
            midinote=1;
        } else {
            midinote=0;
        }
    } else if (firstChar=="D") {
        if (secondChar=="#") {
            midinote=3;
        } else {
            midinote=2;
        }
    } else if (firstChar=="E") {
        midinote=4;
    } else if (firstChar=="F") {
        if (secondChar=="#") {
            midinote=6;
        } else {
            midinote=5;
        }
    } else if (firstChar=="G") {
        if (secondChar=="#") {
            midinote=8;
        } else {
            midinote=7;
        }
    } else if (firstChar=="A") {
        if (secondChar=="#") {
            midinote=10;
        } else {
            midinote=9;
        }
    } else if (firstChar=="B") {
        midinote=11;
    } else if (firstChar=="H") {
        midinote=11;
    }
    return midinote;
}

string Midigen::midinote2txt(int note) {
    int octave=note/12;
    int v=note%12;
    std::string txt = "?";

    switch (v) {
    case 0:
        txt="C";
        break;
    case 1:
        txt="C#";
        break;
    case 2:
        txt="D";
        break;
    case 3:
        txt="D#";
        break;
    case 4:
        txt="E";
        break;
    case 5:
        txt="F";
        break;
    case 6:
        txt="F#";
        break;
    case 7:
        txt="G";
        break;
    case 8:
        txt="G#";
        break;
    case 9:
        txt="A";
        break;
    case 10:
        txt="A#";
        break;
    case 11:
        txt="B";
        break;
    }
    return txt + std::to_string( octave );

}
