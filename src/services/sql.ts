import initSqlJs from 'sql.js';

const STATIC_ASSET = (file: string) => `/sql/${file}`;

export default async function SQL() {
    const builder = await initSqlJs({
        locateFile: STATIC_ASSET
    });

    const db = new builder.Database();

    function analyseCSV() {}

    function loadCSV(data: string) {}

    function query(query: string) {
        return db.exec(query);
    }

    function run(query: string) {
        db.run(query);
    }

    function prepare(query: string) {
        return db.prepare(query).run();
    }
}
