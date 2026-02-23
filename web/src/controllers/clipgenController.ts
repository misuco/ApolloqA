import { Request, Response, NextFunction } from 'express';
import config from '../config/config';

import * as multiparty from 'multiparty';
import * as fs from 'fs';
import * as express from 'express';
import { execSync } from 'child_process';

export const createClip = (req: express.Request, res: express.Response, next: NextFunction) => {
    let query = JSON.stringify(req.query);
    console.log("got newclip " + query);

    let result = execSync(`mkdir -p ${config.web_path}/loops/${req.query.sessionId}`);

    fs.writeFileSync(config.web_path+'/loops/'+req.query.sessionId+'/'+req.query.id+'.json', query);
    result=execSync(config.bin_path_midigen
        + ' -d '+config.web_path+'/data'
        + ' -f '+config.web_path+'/loops/'+req.query.sessionId+'/'+req.query.id
        + ' -s '+config.sf2_path );
    console.log("------------------------------------------------------------------------------");
    console.log("request result :");
    console.log("--> "+result);
    console.log("------------------------------------------------------------------------------");
    res.send("loops/" + req.query.sessionId + "/" + req.query.id);
};
