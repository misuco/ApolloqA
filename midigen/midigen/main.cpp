/**
 * ApolloqA
 *
 * Piano music composition generator
 *
 * (c) 2025 by claudio zopfi
 *
 * Licence: GNU/GPL
 *
 * https://github.com/misuco/antarctica
 *
 */

#include <stdlib.h>
#include <unistd.h>
#include "midigen.hpp"

Midigen mg;
map<int, int> quarterHistogram;

inline bool file_exists (const string& name) {
    ifstream f(name.c_str());
    return f.good();
}

void createNewSong( string filename, int basenote, int scale, int tempo, int mode ) {
    cout << "loading Scale map\n";
    mg.loadScaleMap( "/home/apolloqa/live/ApolloqA/web/static/js/scales_cleaned_sorted.csv" );
    cout << "init Scale filter\n";
    mg.initScaleFilter( scale, basenote );
    mg.setBPM( tempo );
    mg.setMode( mode );
    mg.setSoundfont( "/home/apolloqa/sf2/HS-TB-303.SF2" );
    mg.addInstrument(0);
    mg.addInstrument(5);
    mg.addInstrument(10);
    mg.addInstrument(15);
    mg.addInstrument(20);
    mg.addInstrument(25);
    mg.addInstrument(30);
    mg.addInstrument(35);
    mg.addInstrument(40);
    mg.addInstrument(45);
    mg.addInstrument(50);
    mg.addInstrument(55);
    mg.addInstrument(60);
    mg.addInstrument(65);
    mg.addInstrument(70);
    mg.addInstrument(75);
    mg.addInstrument(80);
    mg.addInstrument(85);
    mg.addChord("E");
    mg.addChord("A");
    mg.addChord("G");
    mg.addChord("C");
    mg.newMidiFile();
    cout << "create_file: " << filename << endl << "tempo: " << tempo << endl;
    mg.saveNewMidiFile( filename );
}

int main(int argc, char *argv[])
{
    string target="midigen";
    int tempo=140;
    int mode=0;
    int basenote=0;
    int scale=0;
    int c;
    while ((c = getopt (argc, argv, "b:m:o:s:t:")) != -1) {
        switch (c)
        {
        case 'b':
            basenote = stoi(optarg);
            break;
        case 'm':
            mode = stoi(optarg);
            break;
        case 'o':
            target = optarg;
            break;
        case 's':
            scale = stoi(optarg);
            break;
        case 't':
            tempo = stoi(optarg);
            break;
        default:
            abort ();
        }
    }    
    createNewSong( target, basenote, scale, tempo, mode );
    return 0;
}
