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
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
})

const app = express();
const cors = require('cors')
app.use(cors())

app.post('/authenticate', (req, res) => {
    console.log("In backened, attempting to authenticate.")

    let username = req.get('username')
    let userpassword = req.get('userpassword')

    let sql = `SELECT * FROM users WHERE username='${username}' AND userpassword='${userpassword}'`

    console.log(sql)

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        console.log(result);
        if (result.length > 0)
            res.json("valid")
        else
            res.json("invalid");
    })
})

app.get('/employees', (req, res) => {
    console.log("Employees retrieved")

    let sql = 'SELECT * FROM employees';

    if (req.get('contains') && req.get('contains') != "") {
        sql += ` WHERE CONCAT(f_name, " ", l_name) LIKE '%${req.get('contains')}%'`
    }

    if(req.get('order'))
        sql += ` ORDER BY l_name ${req.get('order')}`
    else
    sql += ` ORDER BY l_name ASC`

    console.log(sql)

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        res.send(result);
    })
})

app.post('/employees', (req, res) => {
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
        if (err) {
            throw err
        }
        console.log(result);
    })

    // After inserting the employee, send back this employee
    sql = `SELECT * FROM employees WHERE employee_id = '${employee_id}'`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        console.log(result)
        res.send(result);
    })
})

app.put('/employees/:employee_id', (req, res) => {
    let employee_id = req.params.employee_id

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

    console.log("asdsad")
    console.log(sql)

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        res.send(result);
    })
})

app.delete('/employees', (req, res) => {
    let employee_id = req.get('employee_id')

    if (req.get('delete_all')) {
        let sql = `DELETE FROM employees`
        console.log(sql);

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            }
            res.json("All employees removed.")
        })
        console.log("Should have removed all employees");
    }
    else {
        let sql = `DELETE FROM employees WHERE employee_id = '${employee_id}'`
        console.log(sql)

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            }
            res.send(result);
        })
    }
})

app.get('/skills', (req, res) => {
    let sql = 'SELECT * FROM skill_levels ORDER BY skill_name ASC'
    console.log("Skills retrieved")

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        res.send(result)
    })
})

app.post('/skills', (req, res) => {
    let skill_id = req.get('skill_id')

    let skill_name = req.get('skill_name')
    let skill_desc = req.get('skill_desc')

    let sql = `INSERT INTO skill_levels VALUES('${skill_id}', '${skill_name}', '${skill_desc}')`

    console.log(sql);

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        res.send(result);
    })
})

app.put('/skills/:skill_id', (req, res) => {

    let skill_id = req.params.skill_id

    let skill_name = req.get('skill_name')
    let skill_desc = req.get('skill_desc')

    let sql = `UPDATE skill_levels SET skill_name = '${skill_name}', skill_desc = '${skill_desc}' WHERE skill_id = '${skill_id}'`

    console.log(sql)

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        res.send(result);
    })
})

app.delete('/skills', (req, res) => {
    let skill_id = req.get('skill_id')

    if (req.get('delete_all')) {
        let sql = `DELETE FROM skill_levels`
        console.log(sql);

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            }
            res.json("All skills removed.")
        })
        console.log("Should have removed all skills");
    }
    else {
        let sql = `DELETE FROM skill_levels WHERE skill_id = '${skill_id}'`
        console.log(sql)

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            }
            res.send(result);
        })
    }
})

app.listen('4000', () => {
    console.log("Server started on port 4000...");
})