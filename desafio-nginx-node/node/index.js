const express = require('express')
const mysql = require('mysql2')
const { faker } = require('@faker-js/faker')

const app = express()
const port = 3000
const config = {
    host: 'mysql',
    user: 'root',
    password: 'root',
    database: 'nodedb'
}

const connection = mysql.createConnection(config)
const sqlVerify = `SELECT 1 FROM information_schema.tables
                            WHERE table_schema = '${config.database}'
                            AND table_name = 'PEOPLE'
                            LIMIT 1;`
const sqlCreate = `CREATE TABLE PEOPLE (
                                ID INT AUTO_INCREMENT PRIMARY KEY,
                                NOME VARCHAR(250) NOT NULL,
                                CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                            );`
const sqlInsert = `INSERT INTO PEOPLE(nome) VALUES (?);`
const sqlSelect = `SELECT NOME, CRIADO_EM FROM PEOPLE ORDER BY CRIADO_EM DESC;`

const createOrInsert = (cb, res) => {
    const randomName = faker.name.fullName();
    connection.query(sqlInsert, [randomName], (err) => {
        if (err) {
            console.error('Erro ao inserir registro:', err);
            return res.status(500).send('Erro interno (createOrInsert): ' + err);
        }
        cb(res);
    });
};

function fetchAndRender(res) {
    connection.query(sqlSelect, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar registros:', err);
            return res.status(500).send('Erro interno (sqlSelect): ' + err);
        }

        let html = `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <title>Full Cycle</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #4CAF50; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Full Cycle Rocks!</h1>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Criado Em</th>
                </tr>
              </thead>
              <tbody>
        `;

        for (const row of rows) {
          html += `
            <tr>
              <td>${row.NOME}</td>
              <td>${row.CRIADO_EM.toISOString().replace('T', ' ').substr(0, 19)}</td>
            </tr>
          `;
        }

        html += `
              </tbody>
            </table>
          </body>
          </html>
        `;

        res.send(html);
    });
}

app.get('/', (req, res) => {
    connection.query(sqlVerify, (err, result) => {
        if (err) {
            console.error('Erro ao verificar tabela:', err);
            return res.status(500).send('Erro interno: (sqlVerify)' + err);
        }

        const needsCreation = result.length === 0;
        if (needsCreation) {
            connection.query(sqlCreate, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela:', err);
                    return res.status(500).send('Erro interno: (sqlCreate)' + err);
                }
                createOrInsert(fetchAndRender, res);
            });
        } else {
            createOrInsert(fetchAndRender, res);
        }
    });
});

app.listen(port, () => {
    console.log('Rodando na porta ' + port)
})
