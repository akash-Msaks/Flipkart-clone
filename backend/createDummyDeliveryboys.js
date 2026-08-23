const bcrypt = require("bcrypt");
const db = require("./db");

async function createDummyDeliveryPartners() {

    const password = "Delivery@123";

    const hashedPassword =
        await bcrypt.hash(password, 10);

    const users = [
        [
            "Arjun Kumar",
            "arjun.delivery@test.com",
            hashedPassword,
            "DELIVERY_PARTNER",
            true
        ],
        [
            "Suresh Reddy",
            "suresh.delivery@test.com",
            hashedPassword,
            "DELIVERY_PARTNER",
            true
        ],
        [
            "Kiran Kumar",
            "kiran.delivery@test.com",
            hashedPassword,
            "DELIVERY_PARTNER",
            true
        ]
    ];

    const sql = `
        INSERT INTO users
        (name, email, password, role, email_verified)
        VALUES ?
    `;

    db.query(
        sql,
        [users],
        (err, result) => {

            if (err) {

                console.log(
                    "Error:",
                    err
                );

                db.end();

                return;
            }

            console.log(
                `${result.affectedRows} delivery partners created successfully`
            );

            db.end();

        }
    );
}

createDummyDeliveryPartners();