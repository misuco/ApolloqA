import { Request, Response, NextFunction } from 'express';
import { FormFields, FormFiles  } from '../models/item';
import config from '../config/config';

import * as multiparty from 'multiparty';
import * as fs from 'fs';
import * as express from 'express';
import { execSync } from 'child_process';

/*

got post localhost
  {
    "host":"localhost:3000",
    "user-agent":"Mozilla/5.0 (X11;Linux x86_64; rv:140.0) Gecko/20100101Firefox/140.0",
    "accept":"* / *",
    "accept-language":"en-US,en;q=0.5",
    "accept-encoding":"gzip,deflate, br,zstd",
    "referer":"http://localhost:3000/",
    "content-type":"multipart/form-data; boundary=----geckoformboundaryd118c1d8d5d0b3a21877f30ef5d6c54b",
    "content-length":"131508",
    "origin":"http://localhost:3000",
    "connection":"keep-alive",
    "cookie":"nickname=Coco",
    "sec-fetch-dest":"empty",
    "sec-fetch-mode":"cors",
    "sec-fetch-site":"same-origin",
    "priority":"u=4"
  }

  got form fields {"sessionId":["8fac28b6-6bc3-4025-bc3a-8f2eb65bdffa"],"uploadId":["3"],"nickname":["Coco"]}
  got form files {"file":[{"fieldName":"file","originalFilename":"recording.ogg","path":"/tmp/vL5QFoFh8noRor26XeWAIrpA.ogg","headers":{"content-disposition":"form-data; name=\"file\"; filename=\"recording.ogg\"","content-type":"application/octet-stream"},"size":163}]}

*/
export const createUpload = (req: express.Request, res: express.Response, next: NextFunction) => {
  const form = new multiparty.Form();
  console.log(`got post ${req.hostname} ${JSON.stringify(req.headers)}`);

  form.parse(req, (err,fields,files): void => {
    if (err) {
      console.error('Form parsing error:', err);
      res.status(400).send('{"status":"error"}');
      return;
    }

    if(fields.sessionId === undefined) {return;}
    if(fields.nickname === undefined) {return;}
    if(fields.uploadId === undefined) {return;}
    if(files.file === undefined) {return;}

    const sessionId = fields.sessionId;
    const nickname = fields.nickname;
    const uploadId = fields.uploadId;

    const upload = files.file[0].path;

    const result = execSync(`mkdir -p ${config.web_path}/loops/${sessionId}`);
    fs.copyFileSync(upload, `${config.web_path}/loops/${sessionId}/u${uploadId}.ogg`);

  });
  res.send('{"status":"received"}');
}
