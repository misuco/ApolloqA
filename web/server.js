//const https = require('https')
const fs = require('fs')
const express = require('express')
const proc = require('child_process');
const multiparty = require('multiparty');
const config = require('./config')

let clients = new Map();

const app = express()
const port = process.env.PORT || 3033

const createSessionDir = function(sessionId) {
   let result=proc.execSync('mkdir -p '+config.app.web_path+'/loops/'+sessionId);
}

app.use(express.static('static'));
app.use(express.json()) // for parsing application/json

app.post('/post', function(req, res) {
    var form = new multiparty.Form();
    console.log("got post " + req.hostname + " " + JSON.stringify(req.headers));
    form.parse(req, function(err, fields, files) {
        let sessionId=fields.sessionId;
        let nickname=fields.nickname;
        let uploadId=fields.uploadId;
        let upload=files.file[0].path;
        console.log("file upload "+nickname+" "+upload+" "+sessionId);
        var result=proc.execSync('mkdir -p '+config.app.web_path+'/loops/'+sessionId);
        //fs.renameSync(upload,config.app.web_path+'/loops/'+sessionId+"/u"+uploadId+".ogg")
        fs.copyFileSync(upload,config.app.web_path+'/loops/'+sessionId+"/u"+uploadId+".ogg")
    });
    res.send('{"status":"received"}');
});

app.get('/newclip', function(req, res) {
    let query = JSON.stringify(req.query);
    console.log("got newclip " + req.query);
    createSessionDir(req.query.sessionId);
    fs.writeFileSync(config.app.web_path+'/loops/'+req.query.sessionId+'/'+req.query.id+'.json', query);
    result=proc.execSync(config.app.bin_path_midigen
       + ' -c '+req.query.chords
       + ' -s '+req.query.scale
       + ' -b '+req.query.basenote
       + ' -m 0 '
       + ' -t '+req.query.tempo
       + ' -o '+config.app.web_path+'/loops/'+req.query.sessionId+'/'+req.query.id);
   console.log("------------------------------------------------------------------------------");
   console.log("request result :");
   console.log("--> "+result);
   console.log("------------------------------------------------------------------------------");
   res.send("loops/" + req.query.sessionId + "/" + req.query.id);
});

function replacer(key, value) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

app.get('/update_client', function(req, res) {
    const clientId=req.query.clientId;
    const x=req.query.x;
    const y=req.query.y;
    const z=req.query.z;
    const rx=req.query.rx;
    const ry=req.query.ry;
    const rz=req.query.rz;
    const rw=req.query.rw;
    const t=Date.now();
    console.log("update_client "+clientId+" "+x+" "+y+" "+z+" "+rx+" "+ry+" "+rz+" "+rw);
    clients.set(clientId,{"x":x,"y":y,"z":z,"rx":rx,"ry":ry,"rz":rz,"rw":rw,"t":t});
    clients.forEach((value, key) => {
        let inactiveSince=t-value.t;
        console.log("clients: "+key+" "+inactiveSince);
        if(inactiveSince>10000) {
            clients.delete(key);
        }
    });
    res.send(JSON.stringify(clients,replacer));
});

app.get('/client_list', function(req, res) {
    res.send(JSON.stringify(clients,replacer));
});

app.listen(port, () => console.log(`ApolloqA listening at http://localhost:${port}`))
