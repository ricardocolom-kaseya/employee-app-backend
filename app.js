require('dotenv/config')

const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const cors = require('cors');
app.use(cors())

const NodeCache = require('node-cache')

const employeeCache = new NodeCache()
const skillsCache = new NodeCache()

const { faker } = require("@faker-js/faker")

const jwt = require('jsonwebtoken')

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

function authenticateToken(data) {
    const authHeader = data
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return false

    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log("Invalid token");
            return false;
        }
        else
            return true;
    })
}

// Generate the user access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
}

// Authenticate the user
app.post('/authenticate', (req, res) => {
    console.log("In backened, attempting to authenticate.")

    let username = req.body.username
    let userpassword = req.body.userpassword
    const user = { name: username }

    let sql = `SELECT * FROM users WHERE username='${username}' AND userpassword='${userpassword}'`

    console.log(sql)

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        console.log(result);
        if (result.length > 0) {

            let make_employees_table = "CREATE TABLE if not exists employees (employee_id varchar(36) NOT NULL, f_name text, l_name text, dob text, email text, skill_id text, is_active int DEFAULT NULL, PRIMARY KEY (employee_id));  "

            let make_skills_table = "CREATE TABLE if not exists skill_levels (skill_id varchar(36) NOT NULL, skill_name text, skill_desc text, PRIMARY KEY (skill_id)); "

            let make_users_table = "CREATE TABLE if not exists users (id varchar(36) NOT NULL, username varchar(100) DEFAULT NULL, userpassword varchar(100) DEFAULT NULL, PRIMARY KEY (id))"

            db.query(make_employees_table, (err, result) => {
                if (err) {
                    throw err
                }
            })

            db.query(make_skills_table, (err, result) => {
                if (err) {
                    throw err
                }
            })

            db.query(make_users_table, (err, result) => {
                if (err) {
                    throw err
                }
            })

            const generatedToken = generateAccessToken(user)

            res.status(200).json({ accessToken: generatedToken });
        }
        else
            res.status(401).json('Status: Unauthorized');
    })

})

// Get all employees, or employees with specific criteria
app.get('/employees', (req, res) => {

    if (!authenticateToken(req.get('Authorization'))) {
        res.status(401).json();
        return;
    }

    let searchParams = JSON.parse(req.get('Search'))

    let hasCharacters = (searchParams.includesCharacters != "")
    let hasSkill = (searchParams.includesSkill != "")

    if (employeeCache.keys().length > 0) {

        let out = [];

        if (hasCharacters || hasSkill) {

            employeeCache.keys().forEach(key => {
                let currEmployee = employeeCache.get(key)
                if (hasCharacters && hasSkill) {
                    let fullName = (currEmployee.f_name + currEmployee.l_name).toLowerCase()

                    if (fullName.includes(searchParams.includesCharacters) && currEmployee.skill_id === searchParams.includesSkill) {
                        out.push(currEmployee);
                    }
                }
                else if (hasCharacters) {
                    let fullName = (currEmployee.f_name + currEmployee.l_name).toLowerCase()

                    if (fullName.includes(searchParams.includesCharacters)) {
                        out.push(currEmployee);
                    }
                }
                else if (hasSkill) {
                    if (currEmployee.skill_id === searchParams.includesSkill)
                        out.push(currEmployee);
                }
            });
        }
        else {
            employeeCache.keys().forEach(key => {
                let currEmployee = employeeCache.get(key)
                out.push(currEmployee)
            });
        }

        out.sort((a, b) => (a.l_name.toLowerCase() > b.l_name.toLowerCase()) ? 1: -1)

        if (searchParams.order == "DESC")
            out.sort((a, b) => (a.l_name.toLowerCase() < b.l_name.toLowerCase()) ? 1 : -1)

        res.status(200).json(out)
    }
    else {
        let sql = 'SELECT * FROM employees ORDER BY l_name ASC';

        console.log(sql)

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            }
            //console.log(result)
            result.forEach(employee => {
                employeeCache.set(employee.employee_id, employee)
            });

            let out = [];

            employeeCache.keys().forEach(key => {
                out.push(employeeCache.get(key))
            });

            res.status(200).json(out);
        })
    }
})

// Add a new employee
app.post('/employees', (req, res) => {

    if (!authenticateToken(req.get('Authorization'))) {
        return res.status(401).json();
    }

    let employee_id = faker.datatype.uuid();

    let f_name = req.body.employee.f_name
    let l_name = req.body.employee.l_name
    let yyyy = req.body.employee.yyyy
    let mm = req.body.employee.mm
    let dd = req.body.employee.dd
    let email = req.body.employee.email
    let skill_id = req.body.employee.skill_id
    let is_active = req.body.employee.is_active

    let dob = `${yyyy}-${mm}-${dd}`

    let sql = `INSERT INTO employees VALUES('${employee_id}', '${f_name}', '${l_name}', '${dob}', '${email}', '${skill_id}', ${is_active})`
    console.log(sql);

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }
        //console.log(result)

        let newEmployeeBody = {
            employee_id: employee_id,
            f_name: f_name,
            l_name: l_name,
            dob: dob,
            email: email,
            skill_id: skill_id,
            is_active: is_active
        }

        employeeCache.set(employee_id, newEmployeeBody)

        res.status(200).json(employee_id);
    })
})

// Edit an employee
app.put('/employees/:employee_id', (req, res) => {

    if (!authenticateToken(req.get('Authorization'))) {
        res.status(401).json();
        return;
    }

    let employee_id = req.params.employee_id

    let f_name = req.body.employee.f_name
    let l_name = req.body.employee.l_name
    let yyyy = req.body.employee.yyyy
    let mm = req.body.employee.mm
    let dd = req.body.employee.dd
    let email = req.body.employee.email
    let skill_id = req.body.employee.skill_id
    let is_active = req.body.employee.is_active

    let dob = `${yyyy}-${mm}-${dd}`

    let sql = `UPDATE employees SET f_name = '${f_name}', l_name = '${l_name}', dob = '${dob}', email = '${email}', skill_id = '${skill_id}', is_active = ${is_active} WHERE employee_id = '${employee_id}'`
    console.log(sql);

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }

        let newEmployeeBody = {
            employee_id: employee_id,
            f_name: f_name,
            l_name: l_name,
            dob: dob,
            email: email,
            skill_id: skill_id,
            is_active: is_active
        }

        employeeCache.set(employee_id, newEmployeeBody)

        res.status(200).json(req.body.employee);
    })
})

// Delete an employee or all employees
app.delete('/employees', (req, res) => {

    if (!authenticateToken(req.get('Authorization'))) {
        res.status(401).json();
        return;
    }

    let employee_id = req.body.employee_id

    if (!employee_id) {
        let sql = `DELETE FROM employees`

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            }
            employeeCache.del(employeeCache.keys())
            res.status(200).json("All employees removed")
        })
    }
    else {
        let sql = `DELETE FROM employees WHERE employee_id = '${employee_id}'`
        console.log(sql)

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            }
            //console.log(result)
            employeeCache.del(employee_id)
            res.status(200).json("Deleted " + employee_id);
        })
    }
})

// Get all skills
app.get('/skills', (req, res) => {

    if (!authenticateToken(req.get('Authorization'))) {
        res.status(401).json();
        return;
    }

    if (skillsCache.keys().length > 0) {
        let out = [];

        skillsCache.keys().forEach(key => {
            let currSkill = skillsCache.get(key)
            out.push(currSkill)
        })

        out.sort((a, b) => (a.skill_name.toLowerCase() > b.skill_name.toLowerCase()) ? 1 : -1)

        res.status(200).json(out)
    }
    else {
        let sql = 'SELECT * FROM skills ORDER BY skill_name ASC'

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            }

            result.forEach(skill => {
                skillsCache.set(skill.skill_id, skill)
            });

            let out = [];

            skillsCache.keys().forEach(key => {
                out.push(skillsCache.get(key))
            })

            res.status(200).json(out)
        })
    }
})

// Add a new skill
app.post('/skills', (req, res) => {

    if (!authenticateToken(req.get('Authorization'))) {
        res.status(401).json();
        return;
    }

    let skill_id = faker.datatype.uuid()

    let skill_name = req.body.skill_name
    let skill_desc = req.body.skill_desc

    let sql = `INSERT INTO skills VALUES('${skill_id}', '${skill_name}', '${skill_desc}')`

    console.log(sql);

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }

        let newSkillBody = {
            skill_id: skill_id,
            skill_name: skill_name,
            skill_desc: skill_desc,
        }

        skillsCache.set(skill_id, newSkillBody)

        res.status(200).json(skill_id);
    })
})

// Edit a skill
app.put('/skills/:skill_id', (req, res) => {

    if (!authenticateToken(req.get('Authorization'))) {
        res.status(401).json();
        return;
    }

    let skill_id = req.params.skill_id

    let skill_name = req.body.skill_name
    let skill_desc = req.body.skill_desc

    let sql = `UPDATE skills SET skill_name = '${skill_name}', skill_desc = '${skill_desc}' WHERE skill_id = '${skill_id}'`

    console.log(sql)

    db.query(sql, (err, result) => {
        if (err) {
            throw err
        }

        let newSkillBody = {
            skill_id: skill_id,
            skill_name: skill_name,
            skill_desc: skill_desc,
        }

        skillsCache.set(skill_id, newSkillBody)
        res.status(200).json(skill_id);
    })
})

// Delete a skill or all skills
app.delete('/skills', (req, res) => {

    if (!authenticateToken(req.get('Authorization'))) {
        res.status(401).json();
        return;
    }

    let skill_id = req.body.skill_id

    if (!skill_id) {
        let sql = `DELETE FROM skills`

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            }
            skillsCache.del(skillsCache.keys())
            res.status(200).json("All skills removed.")
        })
    }
    else {
        let sql = `DELETE FROM skills WHERE skill_id = '${skill_id}'`
        console.log(sql)

        db.query(sql, (err, result) => {
            if (err) {
                throw err
            }
            skillsCache.del(skill_id)
            res.status(200).json("Removed a skill");
        })
    }
})

app.listen('4000', () => {
    console.log("Server started on port 4000...");
})