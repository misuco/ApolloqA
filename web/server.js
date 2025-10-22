//const https = require('https')
const fs = require('fs')
const express = require('express')
const proc = require('child_process');
var multiparty = require('multiparty');
const config = require('./config')


let clients = new Map();

const app = express()
const port = process.env.PORT || 3033

const createSessionDir = function(sessionId) {
   var result=proc.execSync('mkdir -p '+config.app.web_path+'/loops/'+sessionId);
}

app.use(express.static('static'));
app.use(express.json()) // for parsing application/json

app.post('/post', function(req, res) {
    var form = new multiparty.Form();
    console.log("got post " + req.hostname + " " + JSON.stringify(req.headers));
    form.parse(req, function(err, fields, files) {
        // fields fields fields
        let sessionId=fields.sessionId;
        let nickname=fields.nickname;
        let uploadId=fields.uploadId;
        let upload=files.file[0].path;
        console.log("file upload "+nickname+" "+upload+" "+sessionId);
        var result=proc.execSync('mkdir -p '+config.app.web_path+'/loops/'+sessionId);
        //fs.renameSync(upload,config.app.web_path+'/loops/'+sessionId+"/u"+uploadId+".ogg")
        fs.copyFileSync(upload,config.app.web_path+'/loops/'+sessionId+"/u"+uploadId+".ogg")
        /*
        console.log("parse files "+JSON.stringify(files));
        Object.keys(files).forEach(function(name) {
          console.log('got file named ' + name);
        });
        */
    });
    
    console.log("got post body " + req.body + " " + JSON.stringify(req.body));
    console.log("got post body " + req.body.file + " " + JSON.stringify(req.body.file));
    console.log("got post data " + req.data + " " + JSON.stringify(req.data));
    res.send('{"status":"received"}');
});

app.get('/newclip', function(req, res) {
   console.log("got newclip " + req.query.id);
   console.log(config.app.bin_path_midigen 
       + ' -s '+req.query.scale
       + ' -b '+req.query.basenote
       + ' -m 0 '
       + ' -t '+req.query.tempo 
       + ' -o '+config.app.web_path+'/loops/'+req.query.sessionId+'/'+req.query.id);
       
   createSessionDir(req.query.sessionId);
   //result=proc.execSync(config.app.bin_path_midigen + ' -t '+req.query.tempo+' -p ' + req.query.pitch + ' -b '+req.query.clipId+' -l '+req.query.loopLength+' -r '+req.query.repeat+' -n '+req.query.basenote+' -s '+req.query.scale+' -a '+req.query.arrange+' -c '+req.query.sound+' -o '+config.app.web_path+'/loops/'+req.query.sessionId+'/'+req.query.id);
   result=proc.execSync(config.app.bin_path_midigen 
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

/*
app.get('/newsync', function(req, res) {
   console.log("got newsync " + req.query.id);
   console.log(config.app.bin_path_midigen + ' -m 1 -t '+req.query.tempo+' -o '+config.app.web_path+'/loops/'+req.query.sessionId+'/'+req.query.id);
   createSessionDir(req.query.sessionId);
   result=proc.execSync(config.app.bin_path_midigen + ' -m 1 -t '+req.query.tempo+' -o '+config.app.web_path+'/loops/'+req.query.sessionId+'/'+req.query.id);
   console.log("------------------------------------------------------------------------------");
   console.log("request result :");
   console.log("--> "+result);
   console.log("------------------------------------------------------------------------------");
   res.send("loops/" + req.query.sessionId + "/" + req.query.id);
});

app.get('/rate', function(req, res) {
   console.log("got rating " + req.query.rating + " for " + req.query.trackId);
   var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
   proc.execSync('echo $(date +%Y-%m-%d-%H-%M-%S) '+ip+' >> '+config.app.web_path+'/loops/'+req.query.trackId+'-r-'+req.query.rating);
   res.send("Thanks for your rating for "+req.query.trackId);
});

app.get('/files', function(req, res) {
   console.log("got files request for spot " + req.query.spotId);

   var response ="";
   var files = fs.readdirSync(config.app.web_path+'/loops/').filter(fn => fn.includes( req.query.spotId )).filter(fn => fn.endsWith('-loop.mp3'));
   files.forEach(file => { response += file.replace('-loop.mp3','') + "\n" });
   console.log(response);
   res.send(response);
});

app.get('/soundparams', function(req, res) {
   console.log("got get request for soundparams " + req.query.spotId);

   var respones="";
   try {
      response = fs.readFileSync(config.app.web_path+'/loops/soundparams.json','utf8');
   } catch (err) {
      response=err;
   }
   console.log(response);
   res.send(response);
});

app.post('/soundparams', function(req, res) {
   console.log("got soundparams post");
   createSessionDir(req.query.sessionId);
   try {
      fs.writeFileSync(config.app.web_path+'/loops/'+req.query.sessionId+'/soundparams.json', req.body);
   } catch (err) {
      console.error(err);
   }
   var response = req.body;
   res.send(response);
});

app.get('/rating', function(req, res) {
   console.log("got rating request ");

   var response = "<span>\nrating 3</span><br/>\n";


   var files = fs.readdirSync(config.app.web_path+'/loops/').filter(fn => fn.endsWith('-r-3'));
   files.forEach(file => {
      const p = file.split("_");
      const sector = p[0]+"_"+p[1];
      const spotId = p[2];
      response += "<span onclick=\"requestFilesFromList('"+sector+"','"+spotId+"')\">" + file + "</span><br/>\n" }
   );

   response += "\n<br/><span>rating 2</span><br/>\n";

   var files = fs.readdirSync(config.app.web_path+'/loops/').filter(fn => fn.endsWith('-r-2'));
   files.forEach(file => {
      const p = file.split("_");
      const sector = p[0]+"_"+p[1];
      const spotId = p[2];
      response += "<span onclick=\"requestFilesFromList('"+sector+"','"+spotId+"')\">" + file + "</span><br/>\n" }
   );

   response += "\n<br/><span>rating 1</span><br/>\n";

   var files = fs.readdirSync(config.app.web_path+'/loops/').filter(fn => fn.endsWith('-r-1'));
   files.forEach(file => {
      const p = file.split("_");
      const sector = p[0]+"_"+p[1];
      const spotId = p[2];
      response += "<span onclick=\"requestFilesFromList('"+sector+"','"+spotId+"')\">" + file + "</span><br/>\n" }
   );

   response += "\n<br/><span>all tracks</span><br/>\n";

   var files = fs.readdirSync(config.app.web_path+'/loops/');
   files.forEach(file => {
      const p = file.split("_");
      const sector = p[0]+"_"+p[1];
      const spotId = p[2];
      response += "<span onclick=\"requestFilesFromList('"+sector+"','"+spotId+"')\">" + file + "</span><br/>\n" }
   );

   res.send(response);
});
*/

app.listen(port, () => console.log(`ApolloqA listening at http://localhost:${port}`))
