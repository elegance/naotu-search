import { default as sqlite, Database } from 'sqlite3';

import { FileNode } from './Model';

export default class StoreService {
    db: Database;

    constructor(dbFile: string) {
        let sqlite3 = sqlite.verbose();
        this.db = new sqlite3.Database(dbFile);
        this.ensureTable();
    }

    /**
     * 建表语句
     */
    static CREATE_TABLE_SQL = `
    CREATE TABLE [file_node](
        [file_guid] VARCHAR(50) PRIMARY KEY ON CONFLICT FAIL, 
        [file_name] VARCHAR(100), 
        [ext_name] VARCHAR(10), 
        [parent_guid] VARCHAR(50), 
        [file_type] VARCHAR(10), 
        [create_time] VARCHAR(20), 
        [last_modified_time] VARCHAR(20), 
        [size] INT, 
        [content] TEXT);
    `;

    /**
    * 查询表是否存在
    */
    static EXISTS_TABLES_SQL = `select count(*) cnt from sqlite_master where type = 'table' and name = 'file_node'`;

    /**
     * 存储节点数据到数据库
     * @param fileNodes 节点集合
     */
    storeData(fileNodes: Array<FileNode>) {
        let stmt = this.db.prepare(`INSERT INTO file_node 
            (file_guid, file_name, ext_name, parent_guid, file_type, create_time, last_modified_time, size, content)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        for (let f of fileNodes) {
            stmt.run(f.file_guid, f.file_name, f.ext_name, f.parent_guid, f.file_type, f.create_time, f.last_modified_time, f.size, f.content);
        }
        stmt.finalize()
    }

    /**
     * 从数据库中加载所有数据并返回
     */
    loadData(): Promise<Array<FileNode>> {
        let sql = `select file_guid, file_name, ext_name, parent_guid, file_type, create_time, last_modified_time, size, content from file_node`;

        return new Promise((resolve, reject) => {
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 根据文件唯一id更新文件内容
     * @param fileGuid 文件唯一id
     * @param content 文件内容
     */
    updateContent(fileGuid: string, content: string): Promise<void> {
        return new Promise((resolve, reject) => {
            let sql = `update file_node set content = ? where file_guid = ?`;
            this.db.run(sql, content, fileGuid, () => {
                resolve();
            })
        });
    }

    /**
     * 保证表的存在(不存在时则创建表)
     */
    ensureTable(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.get(StoreService.EXISTS_TABLES_SQL, (error, row) => {
                console.log(row)
                if (error) {
                    reject(error);
                } else if (row.cnt <= 0) {
                    console.log('表不存在，创建表....');
                    this.db.run(StoreService.CREATE_TABLE_SQL, () => {
                        resolve();
                    });
                } else {
                    console.log('表已经存在....')
                    resolve();
                }
            });
        });
    }
}

