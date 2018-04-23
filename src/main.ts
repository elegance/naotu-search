import * as fs from 'fs';
import * as path from 'path';

import NaoTuService from './NaoTuService';
import {FileNode, KmFile} from './Model';


async function main() {
    let cookie = readCookie();
    let naotuService = new NaoTuService(cookie);
    
    try {
        // 获取根目录
        let root = await naotuService.getRootDir();
        let dirGuid = root.file_guid;

        // 列出根目录文件
        let fileNodes:Array<FileNode> = await naotuService.ls(dirGuid);

        for (let fileNode of fileNodes) {
            console.log(fileNode.file_name + ':' + fileNode.file_guid)
        }
    } catch(err) {
        console.error(err);
    }
}

function readCookie() {
    let cookie = fs.readFileSync(path.join(__dirname, '/cookie.txt')).toString();
    if (!cookie) {
        throw `未能获得cookie信息，请登录 http://naotu.baidu.com/home ，并获取cookie放置 cookie.txt中！`;
    }
    return cookie;
}

main();