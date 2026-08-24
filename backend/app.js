 require("dotenv").config();
 const express=require("express");
 const db=require("./db");
 const bcrypt = require("bcrypt");
 const cors = require("cors");
 const jwt = require("jsonwebtoken");
 const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");
 const {
    authenticateToken,
    requireAdmin
} = require("./middleware/authMiddleware");
 const app=express();
 // ==========================================
// EMAIL CONFIGURATION
// ==========================================

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
 const razorpay = new Razorpay({

    key_id:
        process.env.RAZORPAY_KEY_ID,

    key_secret:
        process.env.RAZORPAY_KEY_SECRET

});
 app.use(cors());

app.use(express.json());
 app.get("/",(req,res)=>{
    res.send("FlipKart Backend is Running");
 });
app.get("/api/users", (req, res) => {

    db.query(
        `SELECT id, name, email, role, email_verified
         FROM users`,
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json(result);
        }
    );

});
 

 // ==========================================
// REGISTER
// ==========================================

app.post(
    "/api/auth/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            // ==================================
            // VALIDATION
            // ==================================

            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        "Name, email and password are required"
                });

            }


            // ==================================
            // CHECK EXISTING USER
            // ==================================

            db.query(
                "SELECT * FROM users WHERE email = ?",
                [email],
                async (
                    err,
                    result
                ) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            message:
                                "Database error"
                        });

                    }


                    // ==================================
                    // EMAIL ALREADY EXISTS
                    // ==================================

                    if (
                        result.length > 0
                    ) {

                        return res.status(409).json({
                            message:
                                "Email already registered"
                        });

                    }


                    // ==================================
                    // HASH PASSWORD
                    // ==================================

                    const hashedPassword =
                        await bcrypt.hash(
                            password,
                            10
                        );


                    // ==================================
                    // GENERATE 6 DIGIT OTP
                    // ==================================

                    const otp =
                        Math.floor(
                            100000 +
                            Math.random() *
                            900000
                        ).toString();


                    // ==================================
                    // OTP EXPIRY
                    // 5 MINUTES
                    // ==================================

                   


                    // ==================================
                    // INSERT USER
                    // ==================================

                    const sql = `

    INSERT INTO users
    (
        name,
        email,
        password,
        email_verified,
        email_otp,
        email_otp_expires
    )

    VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        DATE_ADD(NOW(), INTERVAL 5 MINUTE)
    )

`;

                    db.query(
                        sql,

                        [
                          name,
                           email,
                           hashedPassword,
                           false,
                            otp
                        ],

                        async (
                            err,
                            result
                        ) => {

                            if (err) {

                                console.log(err);

                                return res.status(500).json({
                                    message:
                                        "Registration failed"
                                });

                            }


                            // ==================================
                            // SEND EMAIL
                            // ==================================

                            try {

                                await transporter.sendMail({

                                    from:
                                        process.env.EMAIL_USER,

                                    to:
                                        email,

                                    subject:
                                        "ShopKart Email Verification OTP",

                                    html: `

                                        <div
                                            style="
                                                font-family: Arial;
                                                padding: 20px;
                                            "
                                        >

                                            <h2>
                                                Welcome to ShopKart 🛒
                                            </h2>

                                            <p>
                                                Your email verification OTP is:
                                            </p>

                                            <h1>
                                                ${otp}
                                            </h1>

                                            <p>
                                                This OTP will expire in
                                                <strong>
                                                    5 minutes
                                                </strong>.
                                            </p>

                                            <p>
                                                If you did not create this
                                                account, please ignore this email.
                                            </p>

                                        </div>

                                    `

                                });


                                // ==================================
                                // SUCCESS
                                // ==================================

                                res.status(201).json({

                                    message:
                                        "Registration successful. OTP sent to your email.",

                                    userId:
                                        result.insertId,

                                    requiresVerification:
                                        true

                                });


                            } catch (
                                emailError
                            ) {

                                console.log(
                                    "Email sending error:",
                                    emailError
                                );


                                // ==================================
                                // DELETE USER IF EMAIL FAILED
                                // ==================================

                                db.query(
                                    "DELETE FROM users WHERE id = ?",
                                    [
                                        result.insertId
                                    ]
                                );


                                return res.status(500).json({

                                    message:
                                        "Unable to send verification email"

                                });

                            }

                        }
                    );

                }
            );

        } catch (
            error
        ) {

            console.log(
                "Registration error:",
                error
            );


            res.status(500).json({

                message:
                    "Registration failed"

            });

        }

    }
);
// ==========================================
// VERIFY EMAIL OTP
// ==========================================

app.post(
    "/api/auth/verify-email",
    (req, res) => {

        const {
            userId,
            otp
        } = req.body;


        // ==================================
        // VALIDATION
        // ==================================

        if (
            !userId ||
            !otp
        ) {

            return res.status(400).json({

                message:
                    "User ID and OTP are required"

            });

        }


        // ==================================
        // GET USER
        // ==================================

        db.query(
            `
            SELECT
                id,
                email_verified,
                email_otp,
                email_otp_expires
            FROM users
            WHERE id = ?
            `,
            [userId],

            (
                err,
                result
            ) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        message:
                            "Database error"

                    });

                }


                // ==================================
                // USER NOT FOUND
                // ==================================

                if (
                    result.length === 0
                ) {

                    return res.status(404).json({

                        message:
                            "User not found"

                    });

                }


                const user =
                    result[0];


                // ==================================
                // ALREADY VERIFIED
                // ==================================

                if (
                    user.email_verified
                ) {

                    return res.status(400).json({

                        message:
                            "Email is already verified"

                    });

                }


                // ==================================
                // OTP EXPIRED
                // ==================================

                if (
                    !user.email_otp_expires ||
                    new Date(
                        user.email_otp_expires
                    ) < new Date()
                ) {

                    return res.status(400).json({

                        message:
                            "OTP has expired"

                    });

                }


                // ==================================
                // WRONG OTP
                // ==================================

                if (
                    String(
                        otp
                    ) !==
                    String(
                        user.email_otp
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid OTP"

                    });

                }


                // ==================================
                // VERIFY EMAIL
                // ==================================

                db.query(
                    `
                    UPDATE users
                    SET
                        email_verified = TRUE,
                        email_otp = NULL,
                        email_otp_expires = NULL
                    WHERE id = ?
                    `,
                    [userId],

                    (
                        err
                    ) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({

                                message:
                                    "Unable to verify email"

                            });

                        }


                        res.status(200).json({

                            message:
                                "Email verified successfully ✅"

                        });

                    }
                );

            }
        );

    }
);
// ==========================================
// RESEND EMAIL OTP
// ==========================================

app.post(
    "/api/auth/resend-otp",
    async (req, res) => {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, result) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        message: "Database error"
                    });
                }

                if (result.length === 0) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }

                const user = result[0];

                // Already verified
                if (user.email_verified) {
                    return res.status(400).json({
                        message: "Email is already verified"
                    });
                }

                // Generate new OTP
                const otp =
                    Math.floor(
                        100000 +
                        Math.random() * 900000
                    ).toString();

               
                db.query(
    `
    UPDATE users
    SET
        email_otp = ?,
        email_otp_expires =
            DATE_ADD(NOW(), INTERVAL 5 MINUTE)
    WHERE id = ?
    `,
    [
        otp,
        user.id
    ],
                    async (err) => {

                        if (err) {
                            console.log(err);

                            return res.status(500).json({
                                message:
                                    "Unable to generate new OTP"
                            });
                        }

                        try {

                            await transporter.sendMail({

                                from:
                                    process.env.EMAIL_USER,

                                to:
                                    email,

                                subject:
                                    "ShopKart - New Email Verification OTP",

                                html: `

                                    <div
                                        style="
                                            font-family: Arial;
                                            padding: 20px;
                                        "
                                    >

                                        <h2>
                                            ShopKart 🛒
                                        </h2>

                                        <p>
                                            Your new verification OTP is:
                                        </p>

                                        <h1>
                                            ${otp}
                                        </h1>

                                        <p>
                                            This OTP expires in
                                            <strong>5 minutes</strong>.
                                        </p>

                                    </div>

                                `

                            });

                            res.status(200).json({

                                message:
                                    "New OTP sent successfully"

                            });

                        } catch (emailError) {

                            console.log(
                                "Email error:",
                                emailError
                            );

                            return res.status(500).json({

                                message:
                                    "Unable to send OTP"

                            });

                        }

                    }
                );

            }
        );

    }
);
app.post("/api/auth/login", async (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            // User not found
            if (result.length === 0) {

                return res.status(401).json({
                    message: "Invalid email or password"
                });

            }

            const user = result[0];

            // Compare entered password with hashed password
            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {

                return res.status(401).json({
                    message: "Invalid email or password"
                });

            }
            // ==========================================
// CHECK EMAIL VERIFICATION
// ==========================================

if (!user.email_verified) {

    return res.status(403).json({

        message:
            "Please verify your email before logging in"

    });

}

            // Create JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                 process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.json({
                message: "Login successful",
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                     role: user.role
                }
            });

        }
    );

});
// ==========================================
// FORGOT PASSWORD
// ==========================================

app.post(
    "/api/auth/forgot-password",
    async (req, res) => {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                message: "Email is required"
            });

        }

        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message: "Database error"
                    });

                }

                // ==================================
                // USER NOT FOUND
                // ==================================

                if (result.length === 0) {

                    return res.status(404).json({
                        message: "No account found with this email"
                    });

                }

                const user = result[0];


                // ==================================
                // GENERATE OTP
                // ==================================

                const otp =
                    Math.floor(
                        100000 +
                        Math.random() * 900000
                    ).toString();


                // ==================================
                // SAVE OTP
                // MYSQL CREATES 5 MIN EXPIRY
                // ==================================

                db.query(
                    `
                    UPDATE users
                    SET
                        reset_otp = ?,
                        reset_otp_expires =
                            DATE_ADD(NOW(), INTERVAL 5 MINUTE)
                    WHERE id = ?
                    `,
                    [
                        otp,
                        user.id
                    ],
                    async (err) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                message:
                                    "Unable to generate reset OTP"
                            });

                        }


                        // ==================================
                        // SEND EMAIL
                        // ==================================

                        try {

                            await transporter.sendMail({

                                from:
                                    process.env.EMAIL_USER,

                                to:
                                    email,

                                subject:
                                    "ShopKart Password Reset OTP",

                                html: `

                                    <div
                                        style="
                                            font-family: Arial;
                                            padding: 20px;
                                        "
                                    >

                                        <h2>
                                            ShopKart 🔐
                                        </h2>

                                        <p>
                                            We received a request
                                            to reset your password.
                                        </p>

                                        <p>
                                            Your password reset OTP is:
                                        </p>

                                        <h1>
                                            ${otp}
                                        </h1>

                                        <p>
                                            This OTP expires in
                                            <strong>
                                                5 minutes
                                            </strong>.
                                        </p>

                                        <p>
                                            If you did not request
                                            a password reset, please
                                            ignore this email.
                                        </p>

                                    </div>

                                `

                            });


                            res.status(200).json({

                                message:
                                    "Password reset OTP sent successfully"

                            });


                        } catch (emailError) {

                            console.log(
                                "Email error:",
                                emailError
                            );


                            return res.status(500).json({

                                message:
                                    "Unable to send reset OTP"

                            });

                        }

                    }
                );

            }
        );

    }
);
// ==========================================
// VERIFY PASSWORD RESET OTP
// ==========================================

app.post(
    "/api/auth/verify-reset-otp",
    (req, res) => {

        const {
            email,
            otp
        } = req.body;


        // ==================================
        // VALIDATION
        // ==================================

        if (!email || !otp) {

            return res.status(400).json({
                message:
                    "Email and OTP are required"
            });

        }


        // ==================================
        // GET USER
        // ==================================

        db.query(
            `
            SELECT
                id,
                reset_otp,
                reset_otp_expires
            FROM users
            WHERE email = ?
            `,
            [email],

            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message:
                            "Database error"
                    });

                }


                // ==================================
                // USER NOT FOUND
                // ==================================

                if (result.length === 0) {

                    return res.status(404).json({
                        message:
                            "User not found"
                    });

                }


                const user =
                    result[0];


                // ==================================
                // OTP EXISTS?
                // ==================================

                if (!user.reset_otp) {

                    return res.status(400).json({
                        message:
                            "No reset OTP found"
                    });

                }


                // ==================================
                // OTP EXPIRY
                // ==================================

                if (!user.reset_otp_expires) {

                    return res.status(400).json({
                        message:
                            "OTP has expired"
                    });

                }


                // ==================================
                // CHECK OTP EXPIRY
                // ==================================

                if (
                    new Date(
                        user.reset_otp_expires
                    ).getTime() <
                    Date.now()
                ) {

                    return res.status(400).json({
                        message:
                            "OTP has expired"
                    });

                }


                // ==================================
                // CHECK OTP
                // ==================================

                if (
                    String(otp) !==
                    String(user.reset_otp)
                ) {

                    return res.status(400).json({
                        message:
                            "Invalid OTP"
                    });

                }


                // ==================================
                // GENERATE SECURE RESET TOKEN
                // ==================================

                const resetToken =
                    crypto
                        .randomBytes(32)
                        .toString("hex");


                // ==================================
                // STORE RESET TOKEN
                //
                // Token valid for 10 minutes
                // ==================================

                db.query(
                    `
                    UPDATE users
                    SET
                        reset_otp = NULL,
                        reset_otp_expires = NULL,
                        reset_token = ?,
                        reset_token_expires =
                            DATE_ADD(
                                NOW(),
                                INTERVAL 10 MINUTE
                            )
                    WHERE id = ?
                    `,
                    [
                        resetToken,
                        user.id
                    ],

                    (err) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                message:
                                    "Unable to complete verification"
                            });

                        }


                        // ==================================
                        // SUCCESS
                        // ==================================

                        res.status(200).json({

                            message:
                                "OTP verified successfully",

                            resetToken:
                                resetToken

                        });

                    }
                );

            }
        );

    }
);
// ==========================================
// RESET PASSWORD
// ==========================================

app.post(
    "/api/auth/reset-password",
    async (req, res) => {

        const {
            email,
            resetToken,
            newPassword
        } = req.body;


        if (
            !email ||
            !resetToken ||
            !newPassword
        ) {

            return res.status(400).json({

                message:
                    "Email, reset token and new password are required"

            });

        }


        // ==================================
        // PASSWORD VALIDATION
        // ==================================

        if (
            newPassword.length < 6
        ) {

            return res.status(400).json({

                message:
                    "Password must contain at least 6 characters"

            });

        }


        // ==================================
        // FIND USER
        // ==================================

        db.query(
            `
            SELECT
                id,
                reset_token,
                reset_token_expires
            FROM users
            WHERE email = ?
            `,
            [email],

            async (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message:
                            "Database error"
                    });

                }


                if (result.length === 0) {

                    return res.status(404).json({
                        message:
                            "User not found"
                    });

                }


                const user = result[0];


                // ==================================
                // CHECK TOKEN
                // ==================================

                if (
                    !user.reset_token ||
                    user.reset_token !== resetToken
                ) {

                    return res.status(401).json({

                        message:
                            "Invalid or expired reset session"

                    });

                }


                // ==================================
                // CHECK TOKEN EXPIRY
                // ==================================

                if (
                    new Date(
                        user.reset_token_expires
                    ).getTime() <
                    Date.now()
                ) {

                    return res.status(401).json({

                        message:
                            "Reset session has expired"

                    });

                }


                // ==================================
                // HASH NEW PASSWORD
                // ==================================

                const hashedPassword =
                    await bcrypt.hash(
                        newPassword,
                        10
                    );


                // ==================================
                // UPDATE PASSWORD
                // ==================================

                db.query(
                    `
                    UPDATE users
                    SET
                        password = ?,
                        reset_token = NULL,
                        reset_token_expires = NULL
                    WHERE id = ?
                    `,
                    [
                        hashedPassword,
                        user.id
                    ],
                    (err) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({

                                message:
                                    "Unable to reset password"

                            });

                        }


                        res.status(200).json({

                            message:
                                "Password reset successfully ✅"

                        });

                    }
                );

            }
        );

    }
);
// ===============================
// GET ALL PRODUCTS
// ===============================

app.get("/api/products", (req, res) => {

    db.query("SELECT * FROM products", (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });

        }

        res.json(result);

    });

});

// ===============================
// GET SINGLE PRODUCT
// ===============================

app.get("/api/products/:id", (req, res) => {

    const productId = req.params.id;

    db.query(
        "SELECT * FROM products WHERE id = ?",
        [productId],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });

            }

            if (result.length === 0) {

                return res.status(404).json({
                    message: "Product not found"
                });

            }

            res.json(result[0]);

        }
    );

});
// ===============================
// CREATE PRODUCT
// ===============================

app.post("/api/products",
     authenticateToken,
    requireAdmin,
    async (req, res) => {

    const {
        name,
        price,
        category,
        image,
        rating,
        delivery
    } = req.body;

    const sql = `
    INSERT INTO products
    (
        name,
        price,
        category,
        image,
        rating,
        delivery
    )
    VALUES (?, ?, ?, ?, ?, ?)
`;

    db.query(
        sql,
        [name, price, category, image, rating, delivery],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Product creation failed"
                });

            }

            res.status(201).json({
                message: "Product created successfully",
                productId: result.insertId
            });

        }
    );

});
// ===============================
// UPDATE PRODUCT
// ===============================

app.put("/api/products/:id", 
     authenticateToken,
    requireAdmin,
    async (req, res) => {

    const productId = req.params.id;

    const {
        name,
        price,
        category,
        image,
        rating,
        delivery
    } = req.body;

    const sql = `
        UPDATE products
        SET
            name = ?,
            price = ?,
            category = ?,
            image = ?,
            rating = ?,
            delivery = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, price, category, image, rating, delivery, productId],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Product update failed"
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Product not found"
                });

            }

            res.json({
                message: "Product updated successfully"
            });

        }
    );

});

// ===============================
// DELETE PRODUCT
// ===============================

app.delete("/api/products/:id",
     authenticateToken,
    requireAdmin,
    async  (req, res) => {

    const productId = req.params.id;

    db.query(
        "DELETE FROM products WHERE id = ?",
        [productId],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Product deletion failed"
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Product not found"
                });

            }

            res.json({
                message: "Product deleted successfully"
            });

        }
    );

});

// ===============================
// ADD PRODUCT TO CART
// ===============================

app.post(
    "/api/cart",
    authenticateToken,
    (req, res) => {

        const loggedInUserId =
            req.user.id;

        const {
            user_id,
            product_id,
            quantity
        } = req.body;


        // ==================================
        // SECURITY CHECK
        // ==================================

        if (
            Number(user_id) !==
            Number(loggedInUserId)
        ) {

            return res.status(403).json({

                message:
                    "You can only modify your own cart"

            });

        }


        // ==================================
        // VALIDATION
        // ==================================

        if (
            !product_id ||
            !quantity ||
            Number(quantity) <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid product or quantity"

            });

        }


        // ==================================
        // INSERT CART
        // ==================================

        const sql = `
            INSERT INTO cart
            (
                user_id,
                product_id,
                quantity
            )

            VALUES (?, ?, ?)

            ON DUPLICATE KEY UPDATE
                quantity = quantity + VALUES(quantity)
        `;


        db.query(
            sql,
            [
                loggedInUserId,
                product_id,
                quantity
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        message:
                            "Failed to add product to cart"

                    });

                }


                res.status(201).json({

                    message:
                        "Product added to cart",

                    cartId:
                        result.insertId,

                    quantity:
                        quantity

                });

            }
        );

    }
);
// ===============================
// GET USER CART
// ===============================

app.get(
    "/api/cart/:userId",
    authenticateToken,
    (req, res) => {

        // ==================================
        // USER CAN ONLY ACCESS OWN CART
        // ==================================

        if (
            Number(req.params.userId) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({

                message:
                    "You can access only your own cart"

            });

        }


        const userId =
            req.params.userId;


        const sql = `
            SELECT
                cart.id,
                cart.user_id,
                cart.product_id,
                cart.quantity,
                products.name,
                products.price,
                products.image

            FROM cart

            JOIN products
                ON cart.product_id =
                   products.id

            WHERE cart.user_id = ?
        `;


        db.query(
            sql,
            [userId],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        message:
                            "Failed to get cart"

                    });

                }


                res.json(result);

            }
        );

    }
);
// ===============================
// UPDATE CART QUANTITY
// ===============================

app.put(
    "/api/cart/:id",
    authenticateToken,
    (req, res) => {

        const cartId =
            req.params.id;

        const loggedInUserId =
            req.user.id;

        const {
            quantity
        } = req.body;


        // ==================================
        // VALIDATE QUANTITY
        // ==================================

        if (
            quantity === undefined ||
            Number(quantity) <= 0
        ) {

            return res.status(400).json({

                message:
                    "Quantity must be greater than 0"

            });

        }


        // ==================================
        // UPDATE ONLY IF CART BELONGS
        // TO LOGGED-IN USER
        // ==================================

        const sql = `
            UPDATE cart

            SET quantity = ?

            WHERE id = ?

            AND user_id = ?
        `;


        db.query(
            sql,
            [
                quantity,
                cartId,
                loggedInUserId
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        message:
                            "Failed to update cart"

                    });

                }


                // ==================================
                // CART DOES NOT BELONG TO USER
                // OR DOES NOT EXIST
                // ==================================

                if (
                    result.affectedRows === 0
                ) {

                    return res.status(403).json({

                        message:
                            "You can only modify your own cart"

                    });

                }


                // ==================================
                // SUCCESS
                // ==================================

                res.json({

                    message:
                        "Cart updated successfully"

                });

            }
        );

    }
);
// ===============================
// DELETE CART ITEM
// ===============================

app.delete(
    "/api/cart/:id",
    authenticateToken,
    (req, res) => {

        const cartId =
            req.params.id;

        const loggedInUserId =
            req.user.id;


        // ==================================
        // DELETE ONLY OWN CART ITEM
        // ==================================

        const sql = `
            DELETE FROM cart

            WHERE id = ?

            AND user_id = ?
        `;


        db.query(
            sql,
            [
                cartId,
                loggedInUserId
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        message:
                            "Failed to remove cart item"

                    });

                }


                // ==================================
                // ITEM DOES NOT EXIST OR
                // BELONGS TO ANOTHER USER
                // ==================================

                if (
                    result.affectedRows === 0
                ) {

                    return res.status(403).json({

                        message:
                            "You can only delete your own cart"

                    });

                }


                // ==================================
                // SUCCESS
                // ==================================

                res.json({

                    message:
                        "Cart item removed successfully"

                });

            }
        );

    }
);
// ===============================
// GET CART COUNT
// ===============================

app.get(
    "/api/cart/count/:userId",
    authenticateToken,
    (req, res) => {

        try {

            const userId =
                Number(req.params.userId);


            // ===============================
            // CHECK USER ID
            // ===============================

            if (req.user.id !== userId) {

                return res.status(403).json({
                    message:
                        "You can access only your own cart"
                });

            }


            // ===============================
            // GET CART COUNT
            // ===============================

            db.query(
                `
                SELECT COALESCE(
                    SUM(quantity),
                    0
                ) AS totalItems
                FROM cart
                WHERE user_id = ?
                `,
                [userId],

                (err, rows) => {

                    if (err) {

                        console.log(
                            "CART COUNT ERROR:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Unable to get cart count"
                        });

                    }


                    // ===============================
                    // SEND COUNT
                    // ===============================

                    res.status(200).json({

                        totalItems:
                            Number(
                                rows[0].totalItems
                            )

                    });

                }
            );

        } catch (error) {

            console.log(
                "CART COUNT ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to get cart count"
            });

        }

    }
);
// ==========================================
// PLACE ORDER
// ==========================================

app.post("/api/orders", (req, res) => {

    const { user_id } = req.body;


    // ======================================
    // GET USER CART
    // ======================================

    const cartSql = `
        SELECT
            cart.product_id,
            cart.quantity,
            products.price
        FROM cart
        JOIN products
        ON cart.product_id = products.id
        WHERE cart.user_id = ?
    `;


    db.query(
        cartSql,
        [user_id],
        (err, cartItems) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Failed to get cart"
                });

            }


            // ==================================
            // EMPTY CART
            // ==================================

            if (cartItems.length === 0) {

                return res.status(400).json({
                    message: "Cart is empty"
                });

            }


            // ==================================
            // CALCULATE TOTAL
            // ==================================

            let totalAmount = 0;


            cartItems.forEach(function (item) {

                totalAmount +=
                    Number(item.price) *
                    item.quantity;

            });


            // ==================================
            // CREATE ORDER
            // ==================================

            const orderSql = `
                INSERT INTO orders
                (user_id, total_amount, status)
                VALUES (?, ?, ?)
            `;


            db.query(
                orderSql,
                [
                    user_id,
                    totalAmount,
                    "PLACED"
                ],
                (err, orderResult) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            message: "Failed to create order"
                        });

                    }


                    const orderId =
                        orderResult.insertId;


                    // ==================================
                    // CREATE ORDER ITEMS
                    // ==================================

                    const orderItemsSql = `
                        INSERT INTO order_items
                        (order_id, product_id, quantity, price)
                        VALUES ?
                    `;


                    const orderItems =
                        cartItems.map(
                            function (item) {

                                return [
                                    orderId,
                                    item.product_id,
                                    item.quantity,
                                    item.price
                                ];

                            }
                        );


                    db.query(
                        orderItemsSql,
                        [orderItems],
                        (err) => {

                            if (err) {

                                console.log(err);

                                return res.status(500).json({
                                    message:
                                        "Failed to create order items"
                                });

                            }


                            // ==================================
                            // CLEAR CART
                            // ==================================

                            db.query(
                                "DELETE FROM cart WHERE user_id = ?",
                                [user_id],
                                (err) => {

                                    if (err) {

                                        console.log(err);

                                        return res.status(500).json({
                                            message:
                                                "Order created but cart could not be cleared"
                                        });

                                    }


                                    // ==================================
                                    // SUCCESS
                                    // ==================================

                                    res.status(201).json({

                                        message:
                                            "Order placed successfully",

                                        orderId:
                                            orderId,

                                        totalAmount:
                                            totalAmount

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});
// ==========================================
// GET USER ORDERS
// ==========================================

app.get("/api/orders/:userId",  authenticateToken,(req, res) => {
     if (
            Number(req.params.userId) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({
                message:
                    "You can access only your own orders"
            });

        }
    const userId = req.params.userId;

    const sql = `
        SELECT
            o.id AS order_id,
            o.user_id,
            o.total_amount,
            o.status,
            o.created_at,

            oi.id AS order_item_id,
            oi.product_id,
            oi.quantity,

            p.name AS product_name,
            p.price AS product_price,
            p.image AS product_image

        FROM orders o

        JOIN order_items oi
            ON o.id = oi.order_id

        JOIN products p
            ON oi.product_id = p.id

        WHERE o.user_id = ?

        ORDER BY o.created_at DESC
    `;

    db.query(
        sql,
        [userId],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Unable to fetch orders"
                });

            }

            res.json(result);

        }
    );

});
// ==========================================
// GET SINGLE ORDER DETAILS
// ==========================================

app.get("/api/orders/:userId/:orderId", authenticateToken, (req, res) => {
    if (
    Number(req.params.userId) !==
    Number(req.user.id)
) {

    return res.status(403).json({

        message:
            "You can access only your own orders"

    });

}
    const userId = req.params.userId;
    const orderId = req.params.orderId;


    const sql = `
        SELECT
            o.id AS order_id,
            o.user_id,
            o.total_amount,
            o.status,
            o.created_at,

            oi.id AS order_item_id,
            oi.product_id,
            oi.quantity,

            p.name AS product_name,
            p.price AS product_price,
            p.image AS product_image

        FROM orders o

        JOIN order_items oi
            ON o.id = oi.order_id

        JOIN products p
            ON oi.product_id = p.id

        WHERE o.id = ?
        AND o.user_id = ?

        ORDER BY oi.id
    `;


    db.query(
        sql,
        [orderId, userId],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Unable to fetch order details"
                });

            }


            if (result.length === 0) {

                return res.status(404).json({
                    message: "Order not found"
                });

            }


            res.json(result);

        }
    );

});
// ==========================================
// CANCEL ORDER
// ==========================================

app.put(
    "/api/orders/:userId/:orderId/cancel",
    authenticateToken,
    (req, res) => {

        const userId =
            req.params.userId;

        const orderId =
            req.params.orderId;


        // ==================================
        // SECURITY CHECK
        // ==================================

        if (
            Number(userId) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({

                message:
                    "You can only cancel your own orders"

            });

        }


        // ==================================
        // CANCEL ONLY PLACED ORDERS
        // ==================================

        const sql = `
            UPDATE orders

            SET status = 'CANCELLED'

            WHERE id = ?

            AND user_id = ?

            AND status = 'PLACED'
        `;


        db.query(
            sql,
            [
                orderId,
                req.user.id
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        message:
                            "Unable to cancel order"

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(400).json({

                        message:
                            "Order cannot be cancelled"

                    });

                }


                res.json({

                    message:
                        "Order cancelled successfully"

                });

            }
        );

    }
);
// ==========================================
// ADMIN TEST API
// ==========================================

app.get(
    "/api/admin/test",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        res.json({
            message: "Welcome Admin 👑",
            user: req.user
        });

    }
);
// ==========================================
// ADMIN - ADD PRODUCT
// ==========================================

app.post(
    "/api/admin/products",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        const {
            name,
            price,
            category,
            image,
            rating,
            delivery
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !name ||
            price === undefined ||
            !category ||
            !image ||
            rating === undefined ||
            !delivery
        ) {

            return res.status(400).json({
                message: "All product details are required"
            });

        }


        // ======================================
        // INSERT PRODUCT
        // ======================================

        const sql = `
            INSERT INTO products
            (
                name,
                price,
                category,
                image,
                rating,
                delivery
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                name,
                price,
                category,
                image,
                rating,
                delivery
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message: "Unable to add product"
                    });

                }


                res.status(201).json({

                    message: "Product added successfully",

                    productId: result.insertId

                });

            }
        );

    }
);
// ==========================================
// ADMIN - UPDATE PRODUCT
// ==========================================

app.put(
    "/api/admin/products/:id",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        const productId = req.params.id;

        const {
            name,
            price,
            category,
            image,
            rating,
            delivery
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !name ||
            price === undefined ||
            !category ||
            !image ||
            rating === undefined ||
            !delivery
        ) {

            return res.status(400).json({
                message: "All product details are required"
            });

        }


        // ======================================
        // UPDATE PRODUCT
        // ======================================

        const sql = `
            UPDATE products
            SET
                name = ?,
                price = ?,
                category = ?,
                image = ?,
                rating = ?,
                delivery = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                name,
                price,
                category,
                image,
                rating,
                delivery,
                productId
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message: "Unable to update product"
                    });

                }


                // Product doesn't exist

                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        message: "Product not found"
                    });

                }


                res.json({

                    message:
                        "Product updated successfully"

                });

            }
        );

    }
);
// ==========================================
// ADMIN - GET ALL PRODUCTS
// ==========================================

app.get(
    "/api/admin/products",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        const sql = `
            SELECT *
            FROM products
            ORDER BY id DESC
        `;

        db.query(sql, (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Unable to fetch products"
                });

            }

            res.json(result);

        });

    }
);
// ==========================================
// ADMIN - DELETE PRODUCT
// ==========================================

app.delete(
    "/api/admin/products/:id",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        const productId = req.params.id;


        // ======================================
        // DELETE PRODUCT
        // ======================================

        const sql = `
            DELETE FROM products
            WHERE id = ?
        `;


        db.query(
            sql,
            [productId],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message: "Unable to delete product"
                    });

                }


                // Product doesn't exist

                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        message: "Product not found"
                    });

                }


                res.json({

                    message:
                        "Product deleted successfully"

                });

            }
        );

    }
);
// ==========================================
// ADMIN - DASHBOARD
// ==========================================

app.get(
    "/api/admin/dashboard",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        const dashboard = {};

        // ======================================
        // TOTAL USERS
        // ======================================

        const usersQuery = `
            SELECT COUNT(*) AS totalUsers
            FROM users
        `;


        db.query(usersQuery, (err, usersResult) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Unable to get total users"
                });

            }


            dashboard.totalUsers =
                usersResult[0].totalUsers;


            // ==================================
            // TOTAL PRODUCTS
            // ==================================

            const productsQuery = `
                SELECT COUNT(*) AS totalProducts
                FROM products
            `;


            db.query(
                productsQuery,
                (err, productsResult) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            message:
                                "Unable to get total products"
                        });

                    }


                    dashboard.totalProducts =
                        productsResult[0].totalProducts;


                    // ==================================
                    // TOTAL ORDERS
                    // ==================================

                    const ordersQuery = `
                        SELECT COUNT(*) AS totalOrders
                        FROM orders
                    `;


                    db.query(
                        ordersQuery,
                        (err, ordersResult) => {

                            if (err) {

                                console.log(err);

                                return res.status(500).json({
                                    message:
                                        "Unable to get total orders"
                                });

                            }


                            dashboard.totalOrders =
                                ordersResult[0].totalOrders;


                            // ==================================
                            // TOTAL REVENUE
                            // ==================================

                            const revenueQuery = `
                                SELECT
                                    COALESCE(
                                        SUM(total_amount),
                                        0
                                    ) AS totalRevenue
                                FROM orders
                                WHERE status != 'CANCELLED'
                            `;


                            db.query(
                                revenueQuery,
                                (err, revenueResult) => {

                                    if (err) {

                                        console.log(err);

                                        return res.status(500).json({
                                            message:
                                                "Unable to get total revenue"
                                        });

                                    }


                                    dashboard.totalRevenue =
                                        revenueResult[0].totalRevenue;


                                    // ==================================
                                    // SEND DASHBOARD
                                    // ==================================

                                    res.json(
                                        dashboard
                                    );

                                }
                            );

                        }
                    );

                }
            );

        });

    }
);
// ==========================================
// ADMIN - GET ALL USERS
// ==========================================

app.get(
    "/api/admin/users",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        const query = `
            SELECT
                id,
                name,
                email,
                role
            FROM users
            ORDER BY id DESC
        `;


        db.query(
            query,
            (err, results) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message:
                            "Unable to load users"
                    });

                }


                res.json(results);

            }
        );

    }
);
// ==========================================
// ADMIN - GET ALL ORDERS
// ==========================================

app.get(
    "/api/admin/orders",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        const query = `

            SELECT

                o.id AS order_id,

                o.user_id,

                u.name AS customer_name,

                u.email AS customer_email,

                o.total_amount,

                o.status,
           o.delivery_partner_id,

                oi.product_id,
            
                oi.quantity,

                p.name AS product_name,

                p.price AS product_price,

                p.image AS product_image

            FROM orders o

            JOIN users u
                ON o.user_id = u.id

            JOIN order_items oi
                ON o.id = oi.order_id

            JOIN products p
                ON oi.product_id = p.id

            ORDER BY
                o.id DESC

        `;


        db.query(
            query,
            (err, results) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        message:
                            "Unable to load orders"

                    });

                }


                res.json(results);

            }
        );

    }
);
// ==========================================
// ADMIN - UPDATE ORDER STATUS
// ==========================================

app.put(
    "/api/admin/orders/:orderId/status",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        const orderId =
            req.params.orderId;

        const { status } =
            req.body;


        // ======================================
        // VALID STATUSES
        // ======================================

        const validStatuses = [
            "PLACED",
            "CONFIRMED",
            "PACKED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
        ];


        // ======================================
        // CHECK STATUS
        // ======================================

        if (
            !validStatuses.includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Invalid order status"

            });

        }


        // ======================================
        // UPDATE ORDER
        // ======================================

        const query = `

            UPDATE orders

            SET status = ?

            WHERE id = ?

        `;


        db.query(
            query,
            [status, orderId],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        message:
                            "Unable to update order status"

                    });

                }


                // ==================================
                // ORDER NOT FOUND
                // ==================================

                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Order not found"

                    });

                }


                // ==================================
                // SUCCESS
                // ==================================

                res.json({

                    message:
                        "Order status updated successfully",

                    orderId:
                        Number(orderId),

                    status:
                        status

                });

            }
        );

    }
);
// ==========================================
// ADMIN - CREATE DELIVERY PARTNER
// ==========================================

app.post(
    "/api/admin/delivery-partners",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        const {
            name,
            email,
            password,
            phone,
            vehicle_type,
            vehicle_number
        } = req.body;


        // ======================================
        // VALIDATE REQUIRED FIELDS
        // ======================================

        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !vehicle_type ||
            !vehicle_number
        ) {

            return res.status(400).json({

                message:
                    "All delivery partner details are required"

            });

        }


        try {

            // ==================================
            // CHECK EXISTING EMAIL
            // ==================================

            const [existingUsers] =
                await db.promise().query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    `,
                    [email]
                );


            if (existingUsers.length > 0) {

                return res.status(409).json({

                    message:
                        "Email already exists"

                });

            }


            // ==================================
            // HASH PASSWORD
            // ==================================

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            // ==================================
            // CREATE USER
            // ==================================

            const [userResult] =
                await db.promise().query(
                    `
                    INSERT INTO users
                    (
                        name,
                        email,
                        password,
                        role
                    )

                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        name,
                        email,
                        hashedPassword,
                        "DELIVERY_PARTNER"
                    ]
                );


            const userId =
                userResult.insertId;


            // ==================================
            // CREATE DELIVERY PARTNER PROFILE
            // ==================================

            const [partnerResult] =
                await db.promise().query(
                    `
                    INSERT INTO delivery_partners
                    (
                        user_id,
                        phone,
                        vehicle_type,
                        vehicle_number,
                        status
                    )

                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        userId,
                        phone,
                        vehicle_type,
                        vehicle_number,
                        "AVAILABLE"
                    ]
                );


            // ==================================
            // SUCCESS
            // ==================================

            res.status(201).json({

                message:
                    "Delivery partner created successfully",

                userId:
                    userId,

                deliveryPartnerId:
                    partnerResult.insertId

            });


        } catch (error) {

            console.log(
                "Create delivery partner error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to create delivery partner"

            });

        }

    }
);
// ==========================================
// ADMIN - GET DELIVERY PARTNERS
// ==========================================

app.get(
    "/api/admin/delivery-partners",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const [partners] =
                await db.promise().query(`

                    SELECT
                        dp.id,
                        dp.user_id,
                        u.name,
                        u.email,
                        dp.phone,
                        dp.vehicle_type,
                        dp.vehicle_number,
                        dp.status,
                        dp.created_at

                    FROM delivery_partners dp

                    JOIN users u
                        ON dp.user_id = u.id

                    ORDER BY dp.id DESC

                `);


            res.json(partners);


        } catch (error) {

            console.log(
                "Get delivery partners error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to load delivery partners"

            });

        }

    }
);

// ==========================================
// DELIVERY PARTNER - GET MY ORDERS
// ==========================================

app.get(
    "/api/delivery/orders",
    authenticateToken,
    async (req, res) => {

        try {

            // ==================================
            // CHECK DELIVERY PARTNER ROLE
            // ==================================

            if (
                req.user.role !==
                "DELIVERY_PARTNER"
            ) {

                return res.status(403).json({

                    message:
                        "Access denied. Delivery partners only."

                });

            }


            // ==================================
            // GET DELIVERY PARTNER PROFILE
            // ==================================

            const [partners] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        user_id,
                        phone,
                        vehicle_type,
                        vehicle_number,
                        status

                    FROM delivery_partners

                    WHERE user_id = ?
                    `,
                    [req.user.id]
                );


            if (partners.length === 0) {

                return res.status(404).json({

                    message:
                        "Delivery partner profile not found"

                });

            }


            const partner =
                partners[0];


            // ==================================
            // GET ASSIGNED ORDERS
            // ==================================

            const [orders] =
                await db.promise().query(
                    `
                    SELECT

                        o.id AS order_id,

                        o.user_id,

                        u.name AS customer_name,

                        u.email AS customer_email,

                        o.total_amount,

                        o.status,

                        o.created_at,

                        oi.id AS order_item_id,

                        oi.product_id,

                        oi.quantity,

                        oi.price AS order_item_price,

                        p.name AS product_name,

                        p.image AS product_image

                    FROM orders o

                    JOIN users u
                        ON o.user_id = u.id

                    JOIN order_items oi
                        ON o.id = oi.order_id

                    JOIN products p
                        ON oi.product_id = p.id

                    WHERE
                        o.delivery_partner_id = ?

                    ORDER BY
                        o.id DESC

                    `,
                    [partner.id]
                );


            // ==================================
            // RESPONSE
            // ==================================

            res.json({

                partner: {

                    id:
                        partner.id,

                    user_id:
                        partner.user_id,

                    phone:
                        partner.phone,

                    vehicle_type:
                        partner.vehicle_type,

                    vehicle_number:
                        partner.vehicle_number,

                    status:
                        partner.status

                },

                orders:
                    orders

            });


        } catch (error) {

            console.log(
                "Delivery partner orders error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to load delivery orders"

            });

        }

    }
);
// ==========================================
// DELIVERY PARTNER - UPDATE ORDER STATUS
// ==========================================

app.put(
    "/api/delivery/orders/:orderId/status",
    authenticateToken,
    async (req, res) => {

        try {

            // ==================================
            // CHECK ROLE
            // ==================================

            if (
                req.user.role !==
                "DELIVERY_PARTNER"
            ) {

                return res.status(403).json({

                    message:
                        "Access denied. Delivery partners only."

                });

            }


            const orderId =
                req.params.orderId;


            const {
                status
            } = req.body;


            // ==================================
            // VALIDATE STATUS
            // ==================================

            const allowedStatuses = [

                "ACCEPTED",

                "PICKED_UP",

                "OUT_FOR_DELIVERY",

                "DELIVERED"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid delivery status"

                });

            }


            // ==================================
            // FIND DELIVERY PARTNER
            // ==================================

            const [partners] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        user_id,
                        status

                    FROM delivery_partners

                    WHERE user_id = ?
                    `,
                    [req.user.id]
                );


            if (
                partners.length === 0
            ) {

                return res.status(404).json({

                    message:
                        "Delivery partner profile not found"

                });

            }


            const partner =
                partners[0];


            // ==================================
            // FIND ORDER
            // ==================================

            const [orders] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        delivery_partner_id,
                        status

                    FROM orders

                    WHERE id = ?
                    `,
                    [orderId]
                );


            if (
                orders.length === 0
            ) {

                return res.status(404).json({

                    message:
                        "Order not found"

                });

            }


            const order =
                orders[0];


            // ==================================
            // CHECK ORDER ASSIGNMENT
            // ==================================

            if (
                Number(
                    order.delivery_partner_id
                ) !==
                Number(
                    partner.id
                )
            ) {

                return res.status(403).json({

                    message:
                        "This order is not assigned to you"

                });

            }


            // ==================================
            // VALIDATE STATUS TRANSITION
            // ==================================

            const validTransitions = {

                PACKED:
                    "ACCEPTED",

                ACCEPTED:
                    "PICKED_UP",

                PICKED_UP:
                    "OUT_FOR_DELIVERY",

                OUT_FOR_DELIVERY:
                    "DELIVERED"

            };


            if (
                validTransitions[
                    order.status
                ] !== status
            ) {

                return res.status(400).json({

                    message:
                        `Cannot change status from ${order.status} to ${status}`

                });

            }


            // ==================================
            // UPDATE ORDER
            // ==================================

            await db.promise().query(
                `
                UPDATE orders

                SET status = ?

                WHERE id = ?
                `,
                [
                    status,
                    orderId
                ]
            );


            // ==================================
            // IF DELIVERED → RIDER AVAILABLE
            // ==================================

            if (
                status ===
                "DELIVERED"
            ) {

                await db.promise().query(
                    `
                    UPDATE delivery_partners

                    SET status = 'AVAILABLE'

                    WHERE id = ?
                    `,
                    [partner.id]
                );

            }


            // ==================================
            // SUCCESS
            // ==================================

            res.json({

                message:
                    "Order status updated successfully",

                orderId:
                    Number(orderId),

                status:
                    status

            });


        } catch (error) {

            console.log(
                "Delivery status update error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to update order status"

            });

        }

    }
);
// ==========================================
// ADMIN - GET AVAILABLE DELIVERY PARTNERS
// ==========================================

app.get(
    "/api/admin/delivery-partners/available",
    authenticateToken,
     requireAdmin,
    async (req, res) => {

        try {

            // ==================================
            // CHECK ADMIN
            // ==================================

            if (
                req.user.role !== "ADMIN"
            ) {

                return res.status(403).json({

                    message:
                        "Access denied. Admins only."

                });

            }


            // ==================================
            // GET AVAILABLE RIDERS
            // ==================================

            const [partners] =
                await db.promise().query(
                    `
                    SELECT
                        dp.id,
                        dp.user_id,
                        u.name,
                        u.email,
                        dp.phone,
                        dp.vehicle_type,
                        dp.vehicle_number,
                        dp.status

                    FROM delivery_partners dp

                    JOIN users u
                        ON dp.user_id = u.id

                    WHERE dp.status = 'AVAILABLE'

                    ORDER BY
                        dp.id ASC
                    `
                );


            res.json(partners);

        } catch (error) {

            console.log(
                "Available delivery partners error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to fetch available delivery partners"

            });

        }

    }
);
// ==========================================
// ADMIN - ASSIGN DELIVERY PARTNER
// ==========================================

app.put(
    "/api/admin/orders/:orderId/assign",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            // ==================================
            // CHECK ADMIN
            // ==================================

            if (
                req.user.role !== "ADMIN"
            ) {

                return res.status(403).json({

                    message:
                        "Access denied. Admins only."

                });

            }


            const orderId =
                req.params.orderId;


            const {
                delivery_partner_id
            } = req.body;


            // ==================================
            // VALIDATE RIDER ID
            // ==================================

            if (
                !delivery_partner_id
            ) {

                return res.status(400).json({

                    message:
                        "Delivery partner ID is required"

                });

            }


            // ==================================
            // CHECK ORDER
            // ==================================

            const [orders] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        status,
                        delivery_partner_id

                    FROM orders

                    WHERE id = ?
                    `,
                    [orderId]
                );


            if (
                orders.length === 0
            ) {

                return res.status(404).json({

                    message:
                        "Order not found"

                });

            }


            const order =
                orders[0];


            // ==================================
            // CHECK ORDER STATUS
            // ==================================

            if (
                order.status !== "PACKED"
            ) {

                return res.status(400).json({

                    message:
                        "Order must be PACKED before assigning a delivery partner"

                });

            }


            // ==================================
            // CHECK IF ALREADY ASSIGNED
            // ==================================

            if (
                order.delivery_partner_id
            ) {

                return res.status(400).json({

                    message:
                        "A delivery partner is already assigned to this order"

                });

            }


            // ==================================
            // CHECK RIDER
            // ==================================

            const [partners] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        user_id,
                        status

                    FROM delivery_partners

                    WHERE id = ?
                    `,
                    [delivery_partner_id]
                );


            if (
                partners.length === 0
            ) {

                return res.status(404).json({

                    message:
                        "Delivery partner not found"

                });

            }


            const partner =
                partners[0];


            // ==================================
            // CHECK RIDER AVAILABILITY
            // ==================================

            if (
                partner.status !==
                "AVAILABLE"
            ) {

                return res.status(400).json({

                    message:
                        "Delivery partner is not available"

                });

            }


            // ==================================
            // ASSIGN RIDER TO ORDER
            // ==================================

            await db.promise().query(
                `
                UPDATE orders

                SET delivery_partner_id = ?

                WHERE id = ?
                `,
                [
                    delivery_partner_id,
                    orderId
                ]
            );


            // ==================================
            // MAKE RIDER BUSY
            // ==================================

            await db.promise().query(
                `
                UPDATE delivery_partners

                SET status = 'BUSY'

                WHERE id = ?
                `,
                [delivery_partner_id]
            );


            // ==================================
            // SUCCESS
            // ==================================

            res.json({

                message:
                    "Delivery partner assigned successfully",

                orderId:
                    Number(orderId),

                delivery_partner_id:
                    Number(
                        delivery_partner_id
                    ),

                status:
                    "BUSY"

            });


        } catch (error) {

            console.log(
                "Assign delivery partner error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to assign delivery partner"

            });

        }

    }
);
// ==========================================
// PAYMENT - CREATE RAZORPAY ORDER
// ==========================================

app.post(
    "/api/payment/create-order",
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.id;


            const {
                payment_method,
                address
            } = req.body;


            // ==================================
            // VALIDATE PAYMENT METHOD
            // ==================================

            const allowedMethods = [
                "UPI",
                "CARD",
                "NET_BANKING"
            ];


            if (
                !allowedMethods.includes(
                    payment_method
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid online payment method"

                });

            }


            // ==================================
            // VALIDATE ADDRESS
            // ==================================

            if (
                !address ||
                !address.fullName ||
                !address.phone ||
                !address.address ||
                !address.city ||
                !address.state ||
                !address.pincode
            ) {

                return res.status(400).json({

                    message:
                        "Complete delivery address is required"

                });

            }


            // ==================================
            // GET CART FROM DATABASE
            // ==================================

            const [cartItems] =
                await db.promise().query(
                    `
                    SELECT
                        cart.product_id,
                        cart.quantity,
                        products.price

                    FROM cart

                    JOIN products
                        ON cart.product_id =
                           products.id

                    WHERE cart.user_id = ?
                    `,
                    [userId]
                );


            // ==================================
            // EMPTY CART
            // ==================================

            if (
                cartItems.length === 0
            ) {

                return res.status(400).json({

                    message:
                        "Cart is empty"

                });

            }


            // ==================================
            // CALCULATE TOTAL ON SERVER
            // ==================================

            let totalAmount = 0;


            cartItems.forEach(
                function (item) {

                    totalAmount +=
                        Number(
                            item.price
                        ) *
                        Number(
                            item.quantity
                        );

                }
            );


            // ==================================
            // CONVERT TO PAISE
            // ==================================

            const amountInPaise =
                Math.round(
                    totalAmount * 100
                );


            // ==================================
            // CREATE RAZORPAY ORDER
            // ==================================

            const razorpayOrder =
                await razorpay.orders.create({

                    amount:
                        amountInPaise,

                    currency:
                        "INR",

                    receipt:
                        `flipkart_${userId}_${Date.now()}`,

                    notes: {

                        user_id:
                            String(userId),

                        payment_method:
                            payment_method

                    }

                });


            // ==================================
            // CREATE LOCAL PENDING ORDER
            // ==================================

            const [orderResult] =
                await db.promise().query(
                    `
                    INSERT INTO orders
                    (
                        user_id,
                        total_amount,
                        status,
                        payment_method,
                        payment_status,
                        razorpay_order_id,
                        full_name,
                        phone,
                        address,
                        city,
                        state,
                        pincode
                    )

                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [

                        userId,

                        totalAmount,

                        "PAYMENT_PENDING",

                        payment_method,

                        "PENDING",

                        razorpayOrder.id,

                        address.fullName,

                        address.phone,

                        address.address,

                        address.city,

                        address.state,

                        address.pincode

                    ]
                );


            // ==================================
            // SUCCESS
            // ==================================

            res.json({

                key_id:
                    process.env.RAZORPAY_KEY_ID,

                razorpay_order_id:
                    razorpayOrder.id,

                amount:
                    razorpayOrder.amount,

                currency:
                    razorpayOrder.currency,

                localOrderId:
                    orderResult.insertId

            });


        } catch (error) {

            console.log(
                "Create Razorpay order error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to create payment order"

            });

        }

    }
);
// ==========================================
// PAYMENT - CASH ON DELIVERY
// ==========================================

app.post(
    "/api/payment/cod",
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.id;

            const { address } =
                req.body;


            // ==================================
            // VALIDATE ADDRESS
            // ==================================

            if (
                !address ||
                !address.fullName ||
                !address.phone ||
                !address.address ||
                !address.city ||
                !address.state ||
                !address.pincode
            ) {

                return res.status(400).json({

                    message:
                        "Complete delivery address is required"

                });

            }


            // ==================================
            // GET CART
            // ==================================

            const [cartItems] =
                await db.promise().query(
                    `
                    SELECT
                        cart.product_id,
                        cart.quantity,
                        products.price

                    FROM cart

                    JOIN products
                        ON cart.product_id =
                           products.id

                    WHERE cart.user_id = ?
                    `,
                    [userId]
                );


            if (
                cartItems.length === 0
            ) {

                return res.status(400).json({

                    message:
                        "Cart is empty"

                });

            }


            // ==================================
            // CALCULATE TOTAL FROM DATABASE
            // ==================================

            let totalAmount = 0;


            cartItems.forEach(
                function (item) {

                    totalAmount +=
                        Number(item.price) *
                        Number(item.quantity);

                }
            );


            // ==================================
            // CREATE COD ORDER
            // ==================================

            const [orderResult] =
                await db.promise().query(
                    `
                    INSERT INTO orders
                    (
                        user_id,
                        total_amount,
                        status,
                        payment_method,
                        payment_status,
                        full_name,
                        phone,
                        address,
                        city,
                        state,
                        pincode
                    )

                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        userId,
                        totalAmount,
                        "PLACED",
                        "COD",
                        "PENDING",
                        address.fullName,
                        address.phone,
                        address.address,
                        address.city,
                        address.state,
                        address.pincode
                    ]
                );


            const orderId =
                orderResult.insertId;


            // ==================================
            // CREATE ORDER ITEMS
            // ==================================

            const orderItems =
                cartItems.map(
                    function (item) {

                        return [

                            orderId,

                            item.product_id,

                            item.quantity,

                            item.price

                        ];

                    }
                );


            await db.promise().query(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )

                VALUES ?
                `,
                [orderItems]
            );


            // ==================================
            // CLEAR CART
            // ==================================

            await db.promise().query(
                `
                DELETE FROM cart
                WHERE user_id = ?
                `,
                [userId]
            );


            // ==================================
            // SUCCESS
            // ==================================

            res.status(201).json({

                message:
                    "COD order placed successfully",

                orderId:
                    orderId,

                totalAmount:
                    totalAmount

            });


        } catch (error) {

            console.log(
                "COD order error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to place COD order"

            });

        }

    }
);
// ==========================================
// PAYMENT - VERIFY RAZORPAY PAYMENT
// ==========================================

app.post(
    "/api/payment/verify",
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.id;


            const {

                razorpay_payment_id,

                razorpay_order_id,

                razorpay_signature,

                payment_method,

                address

            } = req.body;


            // ==================================
            // VALIDATE PAYMENT RESPONSE
            // ==================================

            if (
                !razorpay_payment_id ||
                !razorpay_order_id ||
                !razorpay_signature
            ) {

                return res.status(400).json({

                    message:
                        "Incomplete payment details"

                });

            }


            // ==================================
            // FIND OUR LOCAL ORDER
            // ==================================

            const [orders] =
                await db.promise().query(
                    `
                    SELECT *

                    FROM orders

                    WHERE razorpay_order_id = ?

                    AND user_id = ?

                    LIMIT 1
                    `,
                    [
                        razorpay_order_id,
                        userId
                    ]
                );


            if (
                orders.length === 0
            ) {

                return res.status(404).json({

                    message:
                        "Payment order not found"

                });

            }


            const order =
                orders[0];


            // ==================================
            // PREVENT DUPLICATE VERIFICATION
            // ==================================

            if (
                order.payment_status ===
                "PAID"
            ) {

                return res.status(400).json({

                    message:
                        "Payment has already been verified"

                });

            }


            // ==================================
            // CREATE SIGNATURE
            // ==================================

            const generatedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        process.env.RAZORPAY_KEY_SECRET
                    )
                    .update(
                        razorpay_order_id +
                        "|" +
                        razorpay_payment_id
                    )
                    .digest("hex");


            // ==================================
            // TIMING SAFE COMPARISON
            // ==================================

            const receivedBuffer =
                Buffer.from(
                    razorpay_signature
                );

            const generatedBuffer =
                Buffer.from(
                    generatedSignature
                );


            if (
                receivedBuffer.length !==
                generatedBuffer.length ||
                !crypto.timingSafeEqual(
                    receivedBuffer,
                    generatedBuffer
                )
            ) {

                return res.status(400).json({

                    message:
                        "Payment verification failed"

                });

            }


            // ==================================
            // GET CART AGAIN
            // ==================================

            const [cartItems] =
                await db.promise().query(
                    `
                    SELECT

                        cart.product_id,

                        cart.quantity,

                        products.price

                    FROM cart

                    JOIN products
                        ON cart.product_id =
                           products.id

                    WHERE cart.user_id = ?
                    `,
                    [userId]
                );


            if (
                cartItems.length === 0
            ) {

                return res.status(400).json({

                    message:
                        "Cart is empty"

                });

            }


            // ==================================
            // VERIFY TOTAL AGAIN
            // ==================================

            let totalAmount = 0;


            cartItems.forEach(
                function (item) {

                    totalAmount +=
                        Number(
                            item.price
                        ) *
                        Number(
                            item.quantity
                        );

                }
            );


            // ==================================
            // CHECK STORED AMOUNT
            // ==================================

            if (
                Number(
                    order.total_amount
                ) !==
                Number(
                    totalAmount
                )
            ) {

                return res.status(400).json({

                    message:
                        "Order amount mismatch"

                });

            }


            // ==================================
            // CREATE ORDER ITEMS
            // ==================================

            const orderItems =
                cartItems.map(
                    function (item) {

                        return [

                            order.id,

                            item.product_id,

                            item.quantity,

                            item.price

                        ];

                    }
                );


            await db.promise().query(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )

                VALUES ?
                `,
                [orderItems]
            );


            // ==================================
            // UPDATE ORDER
            // ==================================

            await db.promise().query(
                `
                UPDATE orders

                SET

                    status = 'PLACED',

                    payment_status = 'PAID',

                    payment_method = ?,

                    razorpay_payment_id = ?

                WHERE id = ?

                AND user_id = ?
                `,
                [

                    payment_method,

                    razorpay_payment_id,

                    order.id,

                    userId

                ]
            );


            // ==================================
            // CLEAR CART
            // ==================================

            await db.promise().query(
                `
                DELETE FROM cart

                WHERE user_id = ?
                `,
                [userId]
            );


            // ==================================
            // SUCCESS
            // ==================================

            res.json({

                message:
                    "Payment verified and order placed successfully",

                orderId:
                    order.id,

                paymentId:
                    razorpay_payment_id

            });


        } catch (error) {

            console.log(
                "Payment verification error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to verify payment"

            });

        }

    }
);
// ==========================================
// PAYMENT - VERIFY RAZORPAY PAYMENT
// ==========================================

app.post(
    "/api/payment/verify",
    authenticateToken,
    async (req, res) => {

        try {

            const userId =
                req.user.id;


            const {

                razorpay_payment_id,

                razorpay_order_id,

                razorpay_signature,

                payment_method,

                address

            } = req.body;


            // ==================================
            // VALIDATE PAYMENT RESPONSE
            // ==================================

            if (
                !razorpay_payment_id ||
                !razorpay_order_id ||
                !razorpay_signature
            ) {

                return res.status(400).json({

                    message:
                        "Incomplete payment details"

                });

            }


            // ==================================
            // FIND OUR LOCAL ORDER
            // ==================================

            const [orders] =
                await db.promise().query(
                    `
                    SELECT *

                    FROM orders

                    WHERE razorpay_order_id = ?

                    AND user_id = ?

                    LIMIT 1
                    `,
                    [
                        razorpay_order_id,
                        userId
                    ]
                );


            if (
                orders.length === 0
            ) {

                return res.status(404).json({

                    message:
                        "Payment order not found"

                });

            }


            const order =
                orders[0];


            // ==================================
            // PREVENT DUPLICATE VERIFICATION
            // ==================================

            if (
                order.payment_status ===
                "PAID"
            ) {

                return res.status(400).json({

                    message:
                        "Payment has already been verified"

                });

            }


            // ==================================
            // CREATE SIGNATURE
            // ==================================

            const generatedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        process.env.RAZORPAY_KEY_SECRET
                    )
                    .update(
                        razorpay_order_id +
                        "|" +
                        razorpay_payment_id
                    )
                    .digest("hex");


            // ==================================
            // TIMING SAFE COMPARISON
            // ==================================

            const receivedBuffer =
                Buffer.from(
                    razorpay_signature
                );

            const generatedBuffer =
                Buffer.from(
                    generatedSignature
                );


            if (
                receivedBuffer.length !==
                generatedBuffer.length ||
                !crypto.timingSafeEqual(
                    receivedBuffer,
                    generatedBuffer
                )
            ) {

                return res.status(400).json({

                    message:
                        "Payment verification failed"

                });

            }


            // ==================================
            // GET CART AGAIN
            // ==================================

            const [cartItems] =
                await db.promise().query(
                    `
                    SELECT

                        cart.product_id,

                        cart.quantity,

                        products.price

                    FROM cart

                    JOIN products
                        ON cart.product_id =
                           products.id

                    WHERE cart.user_id = ?
                    `,
                    [userId]
                );


            if (
                cartItems.length === 0
            ) {

                return res.status(400).json({

                    message:
                        "Cart is empty"

                });

            }


            // ==================================
            // VERIFY TOTAL AGAIN
            // ==================================

            let totalAmount = 0;


            cartItems.forEach(
                function (item) {

                    totalAmount +=
                        Number(
                            item.price
                        ) *
                        Number(
                            item.quantity
                        );

                }
            );


            // ==================================
            // CHECK STORED AMOUNT
            // ==================================

            if (
                Number(
                    order.total_amount
                ) !==
                Number(
                    totalAmount
                )
            ) {

                return res.status(400).json({

                    message:
                        "Order amount mismatch"

                });

            }


            // ==================================
            // CREATE ORDER ITEMS
            // ==================================

            const orderItems =
                cartItems.map(
                    function (item) {

                        return [

                            order.id,

                            item.product_id,

                            item.quantity,

                            item.price

                        ];

                    }
                );


            await db.promise().query(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )

                VALUES ?
                `,
                [orderItems]
            );


            // ==================================
            // UPDATE ORDER
            // ==================================

            await db.promise().query(
                `
                UPDATE orders

                SET

                    status = 'PLACED',

                    payment_status = 'PAID',

                    payment_method = ?,

                    razorpay_payment_id = ?

                WHERE id = ?

                AND user_id = ?
                `,
                [

                    payment_method,

                    razorpay_payment_id,

                    order.id,

                    userId

                ]
            );


            // ==================================
            // CLEAR CART
            // ==================================

            await db.promise().query(
                `
                DELETE FROM cart

                WHERE user_id = ?
                `,
                [userId]
            );


            // ==================================
            // SUCCESS
            // ==================================

            res.json({

                message:
                    "Payment verified and order placed successfully",

                orderId:
                    order.id,

                paymentId:
                    razorpay_payment_id

            });


        } catch (error) {

            console.log(
                "Payment verification error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to verify payment"

            });

        }

    }
);
 app.listen(5001,()=>{
    console.log("Server running on port 5001");
 });