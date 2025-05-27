const mysql = require('mysql2/promise');

async function connDB()
{
    // verifica se já existe uma conexao valida com o BD
    // armazenada no objeto GLOBAL
    if (global.conexao && global.conexao.state !== 'disconnected')
    {
        return global.conexao;
    }

    // caso não exista uma conexao, cria ela
    const connection = mysql.createConnection(
        {
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: 'moviemania'
        }
    );

    // guarda a nova conexao no objeto GLOBAL
    global.conexao = connection;
    
    // retorna a conexao criada
    return global.conexao;
}

/* INSERT - QUERIES */

async function insertNewEmail(email) {
    // conecta com o banco de dados
    const conn = await connDB();

    // prepara o comando SQL
    const sql = `insert into users (username, useremail, userpassword, userphone, fgadmin) values ("", ?, "", "", false);`;

    // executa o SQL
    await conn.query(sql, [email]);
}

async function insertUserInformations(email, name, password, phone) {
    const conn = await connDB();

    const sql = `update users set username=?, userpassword=?, userphone=? where useremail=?;`;

    await conn.query(sql, [name, password, phone, email]);
}

async function insertProfiles(profilename, userid) {
    const conn = await connDB();

    const sql = `insert into profiles (profilename, id_user) values (?, ?);`;

    await conn.query(sql, [profilename, userid]);
}

/* DELETE - QUERIES */

async function cleanEmptyEmails() {
    const conn = await connDB();

    const sql = `delete from users where username = '' and userpassword = '' and userphone = '';`;

    await conn.query(sql);
}

/* SELECT - QUERIES */

async function searchUserByEmail(email) {
    const conn = await connDB();

    const sql = `select * from users where useremail=?;`;;

    // executa o SQL atraves da conexao e armazena o resultado na variável userFound
    const [userFound] = await conn.query(sql, [email]);

    // verifica se userFound possui pelo menos 1 usuario encontrado no banco de dados
    if (userFound && userFound.length > 0) {
        // devolve o userFound para o controle de rotas
        return userFound[0];
    } else {
        // se não existe um userFound retorna um json vazio
        return {};
    }
}

async function verifyUserExistence(email, password) {
    const conn = await connDB();

    const sql = "select * from users where useremail=? and userpassword=?;";

    const [userFound] = await conn.query(sql, [email, password]);

    // verifica se userFound possui pelo menos 1 registro no banco de dados
    if (userFound && userFound.length > 0) {
        // devolve o userFound para o controle de rotas
        return userFound[0];
    } else {
        // se não existe um userFound retorna um json vazio
        return {};
    }
}

async function searchGenres() {
    const conn = await connDB();
    
    const sql = "select * from genres order by gendername;";

    const [genres] = await conn.query(sql);

    return genres;
}

module.exports = {
    insertNewEmail,
    insertUserInformations,
    insertProfiles,
    cleanEmptyEmails,
    searchUserByEmail,
    verifyUserExistence,
    searchGenres
}