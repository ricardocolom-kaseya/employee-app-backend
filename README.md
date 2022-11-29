# Employee Lookup - Backend

By default this runs on port 4000 of your local machine.

## Instructions

- In the project directory run <code>npm install</code> to install all dependencies.
- Create a .env file in the project directory where:

```
PASSWORD=your_mysql_root_password
```
```
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
```

(Note: Your jwt access token can be pretty much any string, a 36-character hex string is what I personally used)

- Import the employeedb schema into MySQL, you can download the schema and its default tables [here](https://drive.google.com/file/d/1gsc1WNAYg3yHRKMwL5JCuLcYHeHFry51/view?usp=sharing).

- Type <code>nodemon</code> in the terminal to start the server.

Main app can be found [here](https://github.com/ricardocolom-kaseya/employee-app/).
