const mysql = require('mysql2/promise');

async function connDB() {
    if (global.conexao && global.conexao.state !== 'disconnected') {
        return global.conexao;
    }

    const connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'moviemania'
    });

    global.conexao = connection;
    return global.conexao;
}

// ===========================
// INSERT - QUERIES 
// ===========================

async function insertUserInformations(email, name, password, phone) {
    const conn = await connDB();
    
    // Este comando SQL tenta inserir um novo usuário
    // Se ele encontrar um e-mail duplicado (por causa da chave UNIQUE),
    // ele executa a parte do ON DUPLICATE KEY UPDATE, atualizando os dados existentes.
    const sql = `
        INSERT INTO users (useremail, username, userpassword, userphone, fgadmin) 
        VALUES (?, ?, ?, ?, false)
        ON DUPLICATE KEY UPDATE 
            username=VALUES(username), 
            userpassword=VALUES(userpassword), 
            userphone=VALUES(userphone);
    `;
    
    await conn.query(sql, [email, name, password, phone]);

    // Busca o usuário para ter certeza que está com os dados mais recentes para retornar
    const user = await searchUserByEmail(email);
    return user;
}

async function insertProfiles(profilename, userid) {
    const conn = await connDB();
    const sql = 'INSERT INTO profiles (profilename, id_user) VALUES (?, ?);';
    await conn.query(sql, [profilename, userid]);
}

async function insertNewGender(gendername) {
    const conn = await connDB();
    const sql = 'INSERT INTO genres (gendername) VALUES (?);';
    await conn.query(sql, [gendername]);
}

// ===========================
// SELECT - QUERIES 
// ===========================

async function searchUserById(id) {
    const conn = await connDB();
    const sql = 'SELECT * FROM users WHERE userid=?;';
    const [rows] = await conn.query(sql, [id]);

    // Retorna o usuário ou null
    return rows.length > 0 ? rows[0] : null; 
}

async function searchUserByEmail(email) {
    const conn = await connDB();
    const sql = 'SELECT * FROM users WHERE useremail=?;';
    const [rows] = await conn.query(sql, [email]);

    // Retorna o usuário ou null
    return rows.length > 0 ? rows[0] : null;
}

async function verifyUserExistence(email, password) {
    const conn = await connDB();
    const sql = "SELECT * FROM users WHERE useremail=? AND userpassword=?;";
    const [rows] = await conn.query(sql, [email, password]);

    // Retorna o usuário ou null
    return rows.length > 0 ? rows[0] : null;
}

async function searchGenres() {
    const conn = await connDB();
    const sql = "SELECT * FROM genres ORDER BY genderid;";
    const [genres] = await conn.query(sql);

    return genres;
}

async function getAmountOfMoviesByGender(gender) {
    const conn = await connDB();
    const sql = "SELECT COUNT(*) AS total FROM movie_gender WHERE id_gender=?";
    const [rows] = await conn.query(sql, [gender]);

    return rows[0].total;
}

async function verifyGenderExistence(name) {
    const conn = await connDB();
    const sql = "SELECT * FROM genres WHERE gendername=?;";
    const [rows] = await conn.query(sql, [name]);

    // Retorna o gênero (se existe) ou false (se não existe)
    return rows.length > 0 ? rows[0] : false;
}

module.exports = {
    insertUserInformations,
    insertProfiles,
    insertNewGender,
    searchUserById,
    searchUserByEmail,
    verifyUserExistence,
    searchGenres,
    getAmountOfMoviesByGender,
    verifyGenderExistence
}