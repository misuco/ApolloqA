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

### prepare node
```
npm install -D typescript ts-node @types/node @types/express nodemon eslint prettier
```

### run dev mode
```
cd web
npm install
npm run dev
```
-> Open in local webbrowser http://localhost:3000

### add own sf2 files
```
apt-get install gigtools # sf2dump
cd sf2
./generate_json.bash > ../web/static/data/instruments.json
```
