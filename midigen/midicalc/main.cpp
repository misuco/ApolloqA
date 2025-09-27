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

#include <stdlib.h>
#include <unistd.h>
#include "midicalc.hpp"

Midicalc mc;
map<int, int> quarterHistogram;

inline bool file_exists (const string& name) {
    ifstream f(name.c_str());
    return f.good();
}

void createNewSong( string filename, int tempo, vector<Midicalc::BlockConfig> config, int scale, int basenote ) {
    mc.setBPM( tempo );
    mc.initScaleFilter(scale,basenote);
    mc.newMidiFile( config );
    cout << "create_file: " << filename << endl << "tempo: " << tempo << endl;
    mc.saveNewMidiFile( filename );
}

int main(int argc, char *argv[])
{

    //if(file_exists(":/data/chords.csv") ) { cout << "chords.csv exists"; } else { cout << "chords.csv does NOT exist"; }
    //if(file_exists(":/data/Schoenberg_-_Sechs_kleine_Klavierstcke_Op._19.mid")) { cout << "_Sechs_kleine_Klavierstcke_Op exists"; } else { cout << "_Sechs_kleine_Klavierstcke_Op does NOT exist"; }

    mc.loadChordMap( "/home/antarctica/axmas/antarctica-midigen/data/chords.csv" );
    mc.loadScaleMap( "/home/antarctica/axmas/antarctica-midigen/data/scales_cleaned_sorted.csv" );
    //mc.loadMidiFile( ":/data/Schoenberg_-_Sechs_kleine_Klavierstcke_Op._19.mid" );
    //mc.loadMidiFile( "/home/c1/ownCloud/studio-exchange/schoenberg/Midi/Schoenberg_-_Sechs_kleine_Klavierstcke_Op._19.mid" );
    //mc.loadMidiFile( "/home/antarctica/Schoenberg_-_Sechs_kleine_Klavierstcke_Op._19.mid" );
    mc.loadMidiFile( "/home/antarctica/bk_xmas1.mid" );
    mc.analyzeMidiFile();

    cout << "Params:";
    for(int i=0;i<argc;i++) {
        cout << " " << argv[i];
    }
    cout << endl;

    string target="test3";
    int block=302;
    int loopLength=4;
    int repeat=1;
    int tempo=70;
    int pitch=0;
    int scale=16;
    int basenote=0;
    int arrange=10;
    int sound=13;

    int c;
    while ((c = getopt (argc, argv, "o:b:l:r:t:p:s:n:a:c:")) != -1) {
        switch (c)
        {
        case 'o':
            target = optarg;
            break;
        case 'b':
            block = stoi(optarg);
            break;
        case 'l':
            loopLength = stoi(optarg);
            break;
        case 'r':
            repeat = stoi(optarg);
            break;
        case 't':
            tempo = stoi(optarg);
            break;
        case 'p':
            pitch = stoi(optarg);
            break;
        case 's':
            scale = stoi(optarg);
            break;
        case 'n':
            basenote = stoi(optarg);
            break;
        case 'a':
            arrange = stoi(optarg);
            break;
        case 'c':
            sound = stoi(optarg);
            break;
        case '?':
            if (optopt == 'c')
                fprintf (stderr, "WARNING: Option -%c requires an argument.\n", optopt);
            else if (isprint (optopt))
                fprintf (stderr, "WARNING: Unknown option `-%c'.\n", optopt);
            else
                fprintf (stderr,
                         "WARNING: Unknown option character `\\x%x'.\n",
                         optopt);
            return 1;
        default:
            abort ();
        }
    }


    cout << "block: " << block << endl << "pitch: " << pitch << endl << "tempo: " << tempo << endl << "repeat: " << repeat << endl << "loopLength: " << loopLength << endl << "scale: " << scale << endl << "basenote: " << basenote << endl << "arrange: " << arrange << endl << "sound: " << sound << endl;

    double secondsPerQuarter = 60.0 / tempo;
    double playTime = 0;
    double minPlayTime = 30;
    double maxPlayTime = 120;

    cout << "seconds_per_quarter: " << secondsPerQuarter << endl;

    vector<Midicalc::BlockConfig> config;

    if( arrange == 0 ) {
        for(int s=0;(s<repeat || playTime<minPlayTime) && playTime<maxPlayTime;s++) {
            for(int c=0;c<loopLength;c++) {
                config.push_back( { block+c, pitch, tempo, basenote, scale, sound } );
            }
            playTime += secondsPerQuarter * loopLength;
        }
    } else if( arrange == 1 ) {
        for(int r=0;r<=20;r++) {
            config.push_back( { block, pitch+r*2, 20 + r*20, basenote, scale, sound } );
        }
        for(int r=0;r<10;r++) {
            config.push_back( { block, pitch+40, 420, basenote, scale, sound } );
        }
        for(int r=20;r>=0;r--) {
            config.push_back( { block, pitch+r*2, 20 + r*20, basenote, scale, sound } );
        }
    } else if( arrange == 2 ) {
        for(int r=0;(r<repeat || playTime<minPlayTime) && playTime<maxPlayTime;r++) {
            config.push_back( { block, pitch, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 5, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 4, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 9, tempo, basenote, scale, sound } );
            playTime += secondsPerQuarter * 4;
        }
    } else if( arrange == 3 ) {
        for(int r=0;(r<repeat || playTime<minPlayTime) && playTime<maxPlayTime;r++) {
            config.push_back( { block, pitch, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 1, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 2, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 3, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 4, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 5, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 6, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 7, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 8, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 9, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 10, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 11, tempo, basenote, scale, sound } );
            playTime += secondsPerQuarter * 12;
        }
    } else if( arrange == 4 ) {
        if(tempo>200 ) tempo/=4;

        for(int r=0;(r<repeat || playTime<minPlayTime) && playTime<maxPlayTime;r++) {
            for(int c=0;c<loopLength;c++) {
                config.push_back( { block+c, pitch, tempo, basenote, scale, sound } );
            }
            for(int c=0;c<loopLength;c++) {
                config.push_back( { block+c, pitch + 5, tempo, basenote, scale, sound } );
            }
            for(int c=0;c<loopLength*2;c++) {
                config.push_back( { block+c, pitch, tempo * 2, basenote, scale, sound } );
            }
            for(int c=0;c<loopLength*2;c++) {
                config.push_back( { block+c, pitch + 5, tempo * 2, basenote, scale, sound } );
            }
            for(int c=0;c<loopLength*3;c++) {
                config.push_back( { block+c, pitch, tempo * 3, basenote, scale, sound } );
            }
            for(int c=0;c<loopLength*3;c++) {
                config.push_back( { block+c, pitch + 5, tempo * 3, basenote, scale, sound } );
            }
            for(int c=0;c<loopLength*4;c++) {
                config.push_back( { block+c, pitch, tempo * 4, basenote, scale, sound } );
            }
            for(int c=0;c<loopLength*4;c++) {
                config.push_back( { block+c, pitch + 5, tempo * 4, basenote, scale, sound } );
            }
            playTime += secondsPerQuarter * 8 * loopLength;
        }
    } else if( arrange == 5 ) {
        for(int s=0;(s<repeat || playTime<minPlayTime) && playTime<maxPlayTime;s++) {
            for(int c=0;c<loopLength;c++) {
                config.push_back( { block+c, pitch, tempo, basenote, scale+s, sound } );
            }
            playTime += secondsPerQuarter * loopLength;
        }
    } else if( arrange == 6 ) {
        for(int n=0;(n<repeat || playTime<minPlayTime) && playTime<maxPlayTime;n++) {
            for(int c=0;c<loopLength;c++) {
                config.push_back( { block+c, pitch, tempo, basenote+n*2, scale, sound } );
            }
            playTime += secondsPerQuarter * loopLength;
        }
    } else if( arrange == 7 ) {
        for(int r=0;(r<repeat || playTime<minPlayTime) && playTime<maxPlayTime;r++) {
            for(int c=0;c<loopLength;c++) {
                config.push_back( { block+c, pitch-24, tempo, basenote, scale, sound } );
            }
            for(int c=0;c<loopLength;c++) {
                config.push_back( { block+c, pitch+24, tempo, basenote, scale, sound } );
            }
            for(int c=0;c<loopLength;c++) {
                config.push_back( { block+c, pitch-12, tempo, basenote, scale, sound } );
            }
            for(int c=0;c<loopLength;c++) {
                config.push_back( { block+c, pitch+12, tempo, basenote, scale, sound } );
            }
            playTime += secondsPerQuarter * loopLength * 4;
        }
    } else if( arrange == 8 ) {
        for(int r=0;(r<repeat || playTime<minPlayTime) && playTime<maxPlayTime;r++) {
            config.push_back( { block, pitch, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 5, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 7, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 5, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch - 4, tempo, basenote, scale, sound } );
            playTime += secondsPerQuarter * 8;
        }
    } else if( arrange == 9 ) {
        for(int r=0;(r<repeat || playTime<minPlayTime) && playTime<maxPlayTime;r++) {
            config.push_back( { block, pitch + 11, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 4, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 9, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 2, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 7, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch - 1, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch, tempo, basenote, scale, sound } );
            config.push_back( { block, pitch + 4, tempo, basenote, scale, sound } );
            playTime += secondsPerQuarter * 8;
        }
    } else {
        for(int r=0;r<repeat;r++) {
            for(int c=0;c<loopLength;c++) {
                config.push_back( { block+c, pitch, tempo, basenote, scale, sound } );
            }
            playTime += secondsPerQuarter * loopLength;
        }
    }

    createNewSong( target, tempo, config, scale, basenote );

    cout << "playtime: " << playTime << endl;

    return 0;
}
