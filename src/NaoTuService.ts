import { default as axios, AxiosInstance } from 'axios';
import qs from 'qs';

import { FileNode } from './Model';

export default class NaoTuService {

    /**
     * axios 请求实例
     */
    axiosInstance: AxiosInstance;

    /**
     * cookie 中提取出的请求 csrfToken
     */
    csrfToken: string;

    /**
     * 默认请求数据
     */
    defaultData: object;

    /**
     * 构造函数
     * @param cookie cookie 文本
     */
    constructor(cookie: string) {
        this.axiosInstance = axios.create({
            baseURL: 'http://naotu.baidu.com/',
            timeout: 3000,
            headers: {
                'Origin': 'http://naotu.baidu.com',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'http://naotu.baidu.com/home',
                'Connection': 'keep-alive',
                'Cookie': cookie
            }
        });
        this.csrfToken = NaoTuService.getCstfTokenByCookie(cookie);
        this.defaultData = {
            'csrf_token': this.csrfToken
        };
    }

    /**
     * 从cookie文本中提取 cstfToken
     * @param cookie cookie字符串
     */
    private static getCstfTokenByCookie(cookie: string): string {
        return cookie.replace(/.+?csrf_cookie=(.+?);.*/, '$1');
    }


    /**
     * 获取根目录
     */
    getRootDir(): Promise<FileNode> {
        return new Promise<FileNode>((resolve, reject) => {
            this.axiosInstance.post('/bos/get_root_dir', qs.stringify(this.defaultData)).then(resp => {
                let { data } = resp.data;
                let node: FileNode = (data as FileNode);
                resolve(node);
            }).catch(reject);
        });
    }


    /**
     * 列出目录下的所有文件
     * @param dirGuid 目录guid
     */
    ls(dirGuid: string): Promise<Array<FileNode>> {
        return new Promise<Array<FileNode>>((resolve, reject) => {
            this.axiosInstance.post('/bos/ls', qs.stringify(Object.assign({ dirGuid }, this.defaultData))).then(resp => {
                let { data } = resp.data;
                let node: Array<FileNode> = (data as Array<FileNode>);
                resolve(node);
            }).catch(reject);
        });
    }

    /**
     * 获取文件详情
     * @param fileGuid 文件guid
     */
    open(fileGuid: string): Promise<string> {
        console.log(`访问网络，获取文件详情`)
        return new Promise<string>((resolve, reject) => {
            this.axiosInstance.post('/bos/open', qs.stringify(Object.assign({ fileGuid }, this.defaultData))).then(resp => {
                // 从结果取得 data.content 字符串
                let { content } = resp.data.data;
                resolve(content);
            }).catch(reject);
        });
    }
}