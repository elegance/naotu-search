import * as fs from 'fs';
import * as path from 'path';

import NaoTuService from './NaoTuService';
import StoreService from './StoreService';
import { FileNode, FileType } from './Model';

let cookie = readCookie();
let naotuService = new NaoTuService(cookie);
let storeService = new StoreService('D:/naotu.db');

// 数据存储的 文件信息，key为fileGuid
let dbDataMap = new Map<string, FileNode>();

// 远端获取的文件信息，key为fileGuid
let remoteDataMap = new Map<string, FileNode>();



async function main() {
    try {
        let dbDatas = await storeService.loadData();

        // 将数据库存储的持久数据填充至map
        fillDbDataMap(dbDatas);

        // 访问remote，递归获取整个目录树
        let root = await naotuService.getRootDir();
        let dirGuid = root.file_guid;

        await resolveDir(dirGuid);

        storeDirData();

        // 查找需要更新的文件，并请求网络获取最新内容执行更新
        let needUpdateDatas = await storeService.loadNeedUpdateData();
        for (let f of needUpdateDatas) {
            console.log(`请求文件: ${f.file_name}`)
            f.content = await naotuService.open(f.file_guid);
            await storeService.updateFile(f);
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * 存储目录数据
 */
function storeDirData() {
    // diff
    let newFileNodes: Array<FileNode> = [];
    let modFileNodes: Array<FileNode> = [];

    for (let [k, v] of remoteDataMap) {
        let dbFileNode = dbDataMap.get(k);

        if (!dbFileNode) { // 数据库不存在，需要 INSERT
            newFileNodes.push(v);
        } else if (v.last_modified_time != dbFileNode.last_modified_time || v.parent_guid != dbFileNode.parent_guid) { // 值被更新，需要UPDATE
            modFileNodes.push(v);
        } else {
            console.log(`${v.file_name} 没有变更，无需更新。`)
        }
    }

    storeService.insertData(newFileNodes);
    storeService.updateData(modFileNodes);
}

/**
 * 填充数据库的数据至map
 * @param dbDatas 数据库存储的信息
 */
function fillDbDataMap(dbDatas: Array<FileNode>) {
    for (let f of dbDatas) {
        dbDataMap.set(f.file_guid, f);
    }
}

/**
 * 遍历处理目录
 * @param dirGuid 目录唯一id
 */
async function resolveDir(dirGuid: string, dir?: FileNode) {
    console.log(`加载目录：${dir ? dir.file_name : '根目录'}`);

    let fileNodes: Array<FileNode> = await naotuService.ls(dirGuid);

    // 获取文件详情、递归目录
    for (let f of fileNodes) {
        remoteDataMap.set(f.file_guid, f);

        if (f.file_type == FileType.DIRECTORY) {
            await resolveDir(f.file_guid, f);
        }
        // 加载阶段不处理文件详情
        // else {
        //     await resolveFile(f);
        // }
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