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

app.get('/getemployees', (req, res) => {
    console.log("Employees retrieved")

    let sql = 'SELECT * FROM employees';
    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.send(result);
    })
})

app.get('/createemployee', (req, res) => {
    let employee_id = req.get('employee_id')
    let f_name = req.get('f_name')
    let l_name = req.get('l_name')
    let yyyy = req.get('yyyy')
    let mm = req.get('mm')
    let dd = req.get('dd')
    let email = req.get('email')
    let skill_id = req.get('skill_id')
    let is_active = req.get('is_active')

    let dob = `${yyyy}-${mm}-${dd}`

    let sql = `INSERT INTO employees VALUES('${employee_id}', '${f_name}', '${l_name}', '${dob}', '${email}', '${skill_id}', ${is_active})`
    console.log(sql);

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        console.log(result);
    })

    // After inserting the employee, send back this employee
    sql = `SELECT * FROM employees WHERE employee_id = '${employee_id}'`;
    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.send(result);
    })
})

app.get('/editemployee', (req, res) => {

    let employee_id = req.get('employee_id')

    let f_name = req.get('f_name')
    let l_name = req.get('l_name')
    let yyyy = req.get('yyyy')
    let mm = req.get('mm')
    let dd = req.get('dd')
    let email = req.get('email')
    let skill_id = req.get('skill_id')
    let is_active = req.get('is_active')

    let dob = `${yyyy}-${mm}-${dd}`

    let sql = `UPDATE employees SET f_name = '${f_name}', l_name = '${l_name}', dob = '${dob}', email = '${email}', skill_id = '${skill_id}', is_active = ${is_active} WHERE employee_id = '${employee_id}'`
    console.log(sql);

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.send(result);
    })
})

app.get('/deleteemployee', (req, res) => {
    let employee_id = req.get('employee_id')

    let sql = `DELETE FROM employees WHERE employee_id = '${employee_id}'`
    console.log(sql)

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.send(result);
    })
})

app.get('/deleteallemployees', (req, res) => {
    let sql = `DELETE FROM employees`
    console.log(sql);

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.json("All employees removed.")
    })
    console.log("Should have removed all employees");
})

app.get('/getskills', (req, res) => {
    let sql = 'SELECT * FROM skill_levels'
    console.log("Skills retrieved")

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.send(result)
    })
})

app.get('/createskill', (req, res) => {

    let skill_id = req.get('skill_id')

    let skill_name = req.get('skill_name')
    let skill_desc = req.get('skill_desc')

    let sql = `INSERT INTO skill_levels VALUES('${skill_id}', '${skill_name}', '${skill_desc}')`

    console.log(sql);

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.send(result);
    })
})

app.get('/editskill', (req, res) => {
    let skill_id = req.get('skill_id')

    let skill_name = req.get('skill_name')
    let skill_desc = req.get('skill_desc')

    let sql = `UPDATE skill_levels SET skill_name = '${skill_name}', skill_desc = '${skill_desc}' WHERE skill_id = '${skill_id}'`

    console.log(sql)

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.send(result);
    })
})

app.get('/deleteskill', (req, res) => {
    let skill_id = req.get('skill_id')

    let sql = `DELETE FROM skill_levels WHERE skill_id = '${skill_id}'`
    console.log(sql)

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.send(result);
    })
})

app.get('/deleteallskills', (req, res) => {
    let sql = `DELETE FROM skill_levels`
    console.log(sql);

    db.query(sql, (err, result) => {
        if(err){
            throw err
        }
        res.json("All skills removed.")
    })
    console.log("Should have removed all skills");
})


app.listen('4000', () => {
    console.log("Server started on port 4000...");
})