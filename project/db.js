const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "database-1.cwdoo4s4ip0y.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "kalyan123",
    database: "users"
});


db.connect((err)=>{
    if(err){
        console.log("Database connection failed");
        console.log(err);
    }
    else{
        console.log("Connected to RDS MySQL");
    }
});


module.exports = db;
