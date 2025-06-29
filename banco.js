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
// DELETE - QUERIES 
// ===========================

async function deleteGender(genderid) {
    const conn = await connDB();
    const sql = "DELETE FROM genres WHERE genderid=?";
    await conn.query(sql, [genderid]);
}

// ===========================
// UPDATE - QUERIES 
// ===========================

async function updateGender(gendername, genderid) {
    const conn = await connDB();
    const sql = "UPDATE genres SET gendername=? WHERE genderid=?;";
    await conn.query(sql, [gendername, genderid]);
}

// ===========================
// SELECT - QUERIES 
// ===========================

async function searchUserById(id) {
    const conn = await connDB();
    const sql = 'SELECT * FROM users WHERE userid=?;';
    const [result] = await conn.query(sql, [id]);

    // Retorna o usuário ou null
    return result.length > 0 ? result[0] : null; 
}

async function searchUserByEmail(email) {
    const conn = await connDB();
    const sql = 'SELECT * FROM users WHERE useremail=?;';
    const [result] = await conn.query(sql, [email]);

    // Retorna o usuário ou null
    return result.length > 0 ? result[0] : null;
}

async function verifyUserExistence(email, password) {
    const conn = await connDB();
    const sql = "SELECT * FROM users WHERE useremail=? AND userpassword=?;";
    const [result] = await conn.query(sql, [email, password]);

    // Retorna o usuário ou null
    return result.length > 0 ? result[0] : null;
}

async function searchGenres() {
    const conn = await connDB();
    const sql = "SELECT * FROM genres ORDER BY genderid;";
    const [genres] = await conn.query(sql);

    return genres;
}

async function getAmountOfMoviesByGender(genderid) {
    const conn = await connDB();
    const sql = "SELECT COUNT(*) AS total FROM movie_gender WHERE id_gender=?";
    const [result] = await conn.query(sql, [genderid]);

    return result[0].total;
}

async function getGendersWithMovieCount() {
    try {
        const genres = await searchGenres(); 

        const genresWithCount = await Promise.all(
            genres.map(async (gender) => {
                const amount = await getAmountOfMoviesByGender(gender.genderid);

                return {
                    genderId: gender.genderid,
                    genderName: gender.gendername,
                    moviesAmount: amount
                };
            })
        );
        
        return genresWithCount;
    } catch (error) {
        console.error("Erro ao buscar gêneros com contagem de filmes:", error);
    }
}

async function verifyGenderExistenceByName(name) {
    const conn = await connDB();
    const sql = "SELECT * FROM genres WHERE gendername=?;";
    const [result] = await conn.query(sql, [name]);

    // Retorna o gênero (se existe) ou false (se não existe)
    return result.length > 0 ? result[0] : false;
}

async function getGenderById(genderid) {
    const conn = await connDB();
    const sql = "SELECT * FROM genres WHERE genderid=?;";
    const [result] = await conn.query(sql, [genderid]);

    // Retorna o gênero (se existe) ou false (se não existe)
    return result.length > 0 ? result[0] : false;
}

module.exports = {
    insertUserInformations,
    insertProfiles,
    insertNewGender,
    deleteGender,
    updateGender,
    searchUserById,
    searchUserByEmail,
    verifyUserExistence,
    searchGenres,
    getAmountOfMoviesByGender,
    getGendersWithMovieCount,
    verifyGenderExistenceByName,
    getGenderById
}