const express = require('express');
const mysql = require('mysql2');

const mysqlpw = require('./pw').pw;

// Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: mysqlpw,
    database: 'employeedb'
});

// Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySQL Connected...');
})

const app = express();
const cors = require('cors')
app.use(cors())

app.get('/test', (req, res) => {
    res.send("this is a test page")
})

app.get('/getemployees', (req, res) => {
    let sql = 'SELECT * FROM employees';
    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.send(result);
    })
})

app.get('/createemployee', (req, res) => {
    let f_name = req.get('f_name')
    let l_name = req.get('l_name')
    let yyyy = req.get('yyyy')
    let mm = req.get('mm')
    let dd = req.get('dd')
    let email = req.get('email')
    let skill_id = req.get('skill_id')
    let is_active = req.get('is_active')

    let dob = `${yyyy}-${mm}-${dd}`

    console.log(dob)

    let sql = `INSERT INTO employees VALUES(UUID(), '${f_name}', '${l_name}', '${dob}', '${email}', '${skill_id}', ${is_active})`
    console.log(sql);

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
    })
})

app.get('/deleteallemployees', (req, res) => {
    let sql = `DELETE FROM employees`
    console.log("All employees removed");

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        console.log("All employees removed")
    })
})

app.listen('4000', () => {
    console.log("Server started on port 4000...");
})