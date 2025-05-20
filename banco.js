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
            database: 'mflix'
        }
    );

    // guarda a nova conexao no objeto GLOBAL
    global.conexao = connection;
    
    // retorna a conexao criada
    return global.conexao;
}

