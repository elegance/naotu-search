import { default as axios, AxiosInstance } from 'axios';
import qs from 'qs';

import { FileNode, KmFile } from './Model';

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
            timeout: 1000,
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
                // 'Cookie': `bds_wiE55BGOG8BkGnpPs6UNtPbb_session=expires_in%3D2592000%26refresh_token%3D22.44ed8f7fe11a3376ae704666b713f042.315360000.1839546274.2600644597-2246711%26access_token%3D21.b5c6712ecb469eca42d1c9683e8c8f7a.2592000.1526778274.2600644597-2246711%26session_secret%3Dcde2adaededcbf121d8a78dfcd7669d3%26session_key%3D9mnRJqRbS65DGbsjX%252BpB%252Fl2r8CbzKXC%252B1H%252FAKAvr%252FA5bcMmF7LevlUq3Oeq3LcSZCKPGPHGHJ5uiuK0VaJkKYP40UcyKwS352Q%253D%253D%26scope%3Dbasic%26expires_at%3D1526778274%26uid%3D2600644597%26uname%3Da494910091%26portrait%3De19b613439343931303039312a06; csrf_cookie=${NaoTuService.csrfToken}`
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
    open(fileGuid: string): Promise<KmFile> {
        return new Promise<KmFile>((resolve, reject) => {
            this.axiosInstance.post('/bos/open', qs.stringify(Object.assign({ fileGuid }, this.defaultData))).then(resp => {
                // 从结果取得 data.content 字符串
                let { content } = resp.data;
                let root = JSON.parse(content);

                resolve((root as KmFile));
            }).catch(reject);
        });
    }
}