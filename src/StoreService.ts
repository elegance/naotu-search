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
        [content] TEXT, 
        [base_update_time] VARCHAR(20), 
        [content_update_time] VARCHAR(20));      
    `;

    /**
    * 查询表是否存在
    */
    static EXISTS_TABLES_SQL = `select count(*) cnt from sqlite_master where type = 'table' and name = 'file_node'`;

    /**
     * 插入节点数据到数据库
     * @param fileNodes 节点集合
     */
    insertData(fileNodes: Array<FileNode>) {
        let stmt = this.db.prepare(`INSERT INTO file_node 
            (file_guid, file_name, ext_name, parent_guid, file_type, create_time, last_modified_time, size, content, base_update_time)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`);

        for (let f of fileNodes) {
            console.log(`插入文件/目录 [${f.file_name}] 的基本信息至数据库`);
            stmt.run(f.file_guid, f.file_name, f.ext_name, f.parent_guid, f.file_type, f.create_time, f.last_modified_time, f.size, f.content);
        }
        stmt.finalize()
    }

    /**
     * 更新节点数据到数据库
     * @param fileNodes 节点集合
     */
    updateData(fileNodes: Array<FileNode>) {
        
        let stmt = this.db.prepare(`UPDATE file_node 
            set file_name = ?, ext_name = ?, parent_guid = ?, file_type = ?, create_time = ?, last_modified_time = ?, size = ?, content = ?, base_update_time = datetime('now', 'localtime')
            where file_guid = ?`);

        for (let f of fileNodes) {
            console.log(`更新文件/目录 [${f.file_name}] 基本信息至数据库`);
            stmt.run(f.file_name, f.ext_name, f.parent_guid, f.file_type, f.create_time, f.last_modified_time, f.size, f.content, f.file_guid);
        }
        stmt.finalize()
    }

    /**
     * 更新当文件数据到数据库 - 用于获取文件详情的更新
     * @param f 单个文件节点
     */
    updateFile(f: FileNode): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log(`更新文件 [${f.file_name}] content至数据库`);
            let sql = `UPDATE file_node 
                set file_name = ?, ext_name = ?, parent_guid = ?, file_type = ?, create_time = ?, last_modified_time = ?, size = ?, content = ?, content_update_time = base_update_time
                where file_guid = ?`;
            this.db.run(sql, f.file_name, f.ext_name, f.parent_guid, f.file_type, f.create_time, f.last_modified_time, f.size, f.content, f.file_guid, () => {
                resolve();
            })
        });
    }

    /**
     * 从数据库中加载所有数据并返回
     */
    loadData(): Promise<Array<FileNode>> {
        console.log('从数据库加载所有数据...');
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

    loadNeedUpdateData(): Promise<Array<FileNode>> {
        console.log('从数据库加载需要更新文件内容的数据...');
        let sql = `select file_guid, file_name, ext_name, parent_guid, file_type, create_time, last_modified_time, size, content from file_node where file_type = 'file' 
        and (content_update_time <> base_update_time or (base_update_time IS NOT NULL AND content_update_time IS NULL))`;

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
     * 保证表的存在(不存在时则创建表)
     */
    ensureTable(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.get(StoreService.EXISTS_TABLES_SQL, (error, row) => {
                if (error) {
                    reject(error);
                } else if (row.cnt <= 0) {
                    console.log('表不存在，创建表....');
                    this.db.run(StoreService.CREATE_TABLE_SQL, () => {
                        resolve();
                    });
                } else {
                    console.log('表已经存在，跳过创建....')
                    resolve();
                }
            });
        });
    }
}

