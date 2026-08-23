const bcrypt = require("bcrypt");
const db = require("./db");

async function createDummyUsers() {

    const password = "Test@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [
        [
            "Rahul Kumar",
            "rahul.test@gmail.com",
            hashedPassword,
            "CUSTOMER",
            true
        ],
        [
            "Priya Sharma",
            "priya.test@gmail.com",
            hashedPassword,
            "CUSTOMER",
            true
        ],
        [
            "Nithin Reddy",
            "nithin.test@gmail.com",
            hashedPassword,
            "CUSTOMER",
            true
        ]
    ];

    const sql = `
        INSERT INTO users
        (name, email, password, role, email_verified)
        VALUES ?
    `;

    db.query(sql, [users], (err, result) => {

        if (err) {

            console.log("Error:", err);

            return;

        }

        console.log(
            `${result.affectedRows} dummy customers created successfully`
        );

        db.end();

    });
}

createDummyUsers();