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
    mg.loadScaleMap( "/home/apolloqa/ApolloqA/web/static/js/scales_cleaned_sorted.csv" );
    cout << "init Scale filter\n";
    mg.initScaleFilter( scale, basenote );
    mg.setBPM( tempo );
    mg.setMode( mode );
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
