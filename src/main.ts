import * as fs from 'fs';
import * as path from 'path';

import NaoTuService from './NaoTuService';
import StoreService from './StoreService';
import { FileNode, KmFile, FileType } from './Model';

let cookie = readCookie();
let naotuService = new NaoTuService(cookie);
let storeService = new StoreService('D:/naotu.db');



async function main() {
   
    try {


        let dbDatas = await storeService.loadData();

        // 数据库有数据，做同步
        // 同步包括：
        // 增加：db 不存在，http接口存在者，插入
        // 删除：db 存在，http接口不存在者，做 删除标志
        // 修改: 根据唯一id，更新修改名称、内容、大小 等

        if (dbDatas.length > 0) {
            // TODO 
            // 存储， dbDatas map: fileGuid => file
        } else {
            // 初始查询， 从跟开始遍历获取，文件则调用接口获取数据，目录则列递归目录

            // 获取根目录
            let root = await naotuService.getRootDir();
            let dirGuid = root.file_guid;

            // 从根目录开始处理
            resolveDir(dirGuid);

            //TODO 存储http Map， remoteDatas map: fileGuid => file
        }

    } catch (err) {
        console.error(err);
    }
}

/**
 * 遍历处理目录
 * @param dirGuid 目录唯一id
 */
async function resolveDir(dirGuid:string) {
    console.log(`处理目录：${dirGuid}`)
    let fileNodes: Array<FileNode> = await naotuService.ls(dirGuid);

    // 先把文件、目录的基本数据全部保存至数据库
    storeService.storeData(fileNodes);

    // 获取文件详情、递归目录
    for (let f of fileNodes) {
        if (f.file_type == FileType.FILE) {
            await resolveFile(f.file_guid);
        } else {
            await resolveDir(f.file_guid);
        }
    }
}

/**
 * 处理文件，获取文件内容并保存至数据库
 * @param fileGuid 文件唯一id
 */
async function resolveFile(fileGuid:string) {
    console.log(`请求文件: ${fileGuid}`)
    let kmFile = await naotuService.open(fileGuid);
    let content = JSON.stringify(kmFile);
    await storeService.updateContent(fileGuid, content);
}

function readCookie() {
    let cookie = fs.readFileSync(path.join(__dirname, '/cookie.txt')).toString();
    if (!cookie) {
        throw `未能获得cookie信息，请登录 http://naotu.baidu.com/home ，并获取cookie放置 cookie.txt中！`;
    }
    return cookie;
}

main();