require('dotenv/config')

const express = require('express');
const mysql = require('mysql2');
var random = require('random-name')

// Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.PASSWORD,
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

app.get('/createrandomemployee', (req, res) => {
    function getRandomInt(max){
        return Math.floor(Math.random() * max)
    }

    let f_name = random.first();
    let l_name = random.last();
    if(l_name.includes("W"))
        console.log("has a W");
    let yyyy = 1950 + getRandomInt(52);
    let mm = 1 + getRandomInt(12);
    let dd = 1 + getRandomInt(28);
    let email = `${f_name.toLowerCase()}.${l_name.toLowerCase()}@gmail.com`
    let skill_id = "a0e1827d-61fd-11ed-b1bd-803f5d06682c"
    let is_active = getRandomInt(2);

    let dob = `${yyyy}-${mm}-${dd}`

    let sql = `INSERT INTO employees VALUES(UUID(), '${f_name}', '${l_name}', '${dob}', '${email}', '${skill_id}', ${is_active})`
    
    console.log(f_name);
    console.log(l_name);
    
    console.log(sql);
    res.json(["test"])
})

app.get('/deleteallemployees', (req, res) => {
    let sql = `DELETE FROM employees`
    console.log(sql);

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        console.log("All employees removed")
    })
    console.log("Should have removed all employees");
})

app.listen('4000', () => {
    console.log("Server started on port 4000...");
})