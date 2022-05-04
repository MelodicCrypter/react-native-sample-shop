import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('ezhopImages.db');

export const dbInit = () => {
    const sqlCommand =
        'CREATE TABLE IF NOT EXISTS ezhopImages (id INTEGER PRIMARY KEY NOT NULL, imageUri TEXT NOT NULL);';

    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                sqlCommand,
                [],
                () => resolve(),
                (_, err) => reject(err)
            );
        });
    });

    return promise;
};

export const insertImage = (imageUri) => {
    const sqlCommand = `INSERT INTO ezhopImages (imageUrl) VALUES (?);`;

    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                sqlCommand,
                [imageUri],
                (_, result) => resolve(result),
                (_, err) => reject(err)
            );
        });
    });

    return promise;
};
