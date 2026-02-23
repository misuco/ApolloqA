# ApolloqA
Collaborative music platform

Demo: https://apolloqa.net/

## local setup

### install midigen
```
git clone git@github.com:misuco/midigen.git
mkdir build-midigen
cd build-midigen
cmake ../midigen
make
```

### install apolloqa
```
git clone git@github.com:misuco/ApolloqA.git
cd ApolloqA
git submodule init
git submodule update
```

### run dev mode
```
cd web
npm install
npm run dev
```
-> Open in local webbrowser http://localhost:3000

### add own sf2 files were changed
```
apt-get install gigtools #(sf2dump)
cd sf2
./generate_json.bash > ../web/static/data/instruments.json
```
