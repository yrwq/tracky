const express = require('express')
const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
const cors = require('cors')
const moment = require('moment')

const app = express()

app.use(express.json())

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'id']
}))

dotenv.config()

const pool = mysql.createPool({
    connectionLimit: 10,
    queueLimit: 0,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
})

app.get('/', (req, res) => {
    res.send("Welcome to the API!")
})

app.get('/expenses', async (req, res) => {
    try {
        const [results] = await pool.execute('CALL GetExpenses')
        res.send(results[0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get('/expenses/id/:id', async (req, res) => {
    const id = req.params.id

    try {
        const [results] = await pool.execute('CALL GetExpenseByid(?)', [ id ])
        res.send(results[0][0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get('/expenses/month/:month', async (req, res) => {
    const month = req.params.month

    try {
        const [results] = await pool.execute('CALL GetExpensesByMonth(?)', [ month ])
        res.send(results[0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get('/expenses/month/sum/:month', async (req, res) => {
    const month = req.params.month

    try {
        const [results] = await pool.execute('CALL CalculateExpenseByMonth(?)', [ month ])
        res.send(results[0][0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.get('/expenses/categories', async (req, res) => {
    try {
        const [results] = await pool.execute('CALL GetCategories')
        res.send(results[0])
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/expenses/categories/new', async (req, res) => {
    const {
        category
    } = req.body
    if(!category) return res.status(400).json({ message: "Kategória megadása kötelező!" })

    try {
        const [result] = await pool.execute('CALL AddCategory(?)', [
            category,
        ])

        if(result.affectedRows > 0) {
            return res.status(201).json({ message: 'Rekord rögzítve.' })
        } else {
            console.log(result)
            return res.status(500).json({ message: 'Sikertelen rögzítés.' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/expenses/categories/delete', async (req, res) => {
    const {
        category
    } = req.body
    if(!category) return res.status(400).json({ message: "Kategória megadása kötelező!" })

    try {
        const [result] = await pool.execute('CALL DeleteCategoryByName(?)', [
            category,
        ])

        if(result.affectedRows > 0) {
            return res.status(201).json({ message: 'Rekord törölve.' })
        } else {
            console.log(result)
            return res.status(500).json({ message: 'Sikertelen torlés.' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/expenses/new', async (req, res) => {
    const {
        month,
        category,
        amount,
        description
    } = req.body

    if(!month) return res.status(400).json({ message: "Hónap megadása kötelező!" })
    if(!category) return res.status(400).json({ message: "Kategória megadása kötelező!" })
    if(!amount) return res.status(400).json({ message: "Összeg megadása kötelező!" })
    if(!description) return res.status(400).json({ message: "Leírás megadása kötelező!" })

    try {
        const [result] = await pool.execute('CALL AddExpense(?,?,?,?)', [
            month,
            category,
            amount,
            description
        ])

        if(result.affectedRows > 0) {
            return res.status(201).json({ message: 'Rekord rögzítve.' })
        } else {
            console.log(result)
            return res.status(500).json({ message: 'Sikertelen rögzítés.' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/expenses/delete', async (req, res) => {
    const {
        id
    } = req.body

    if(!id) return res.status(400).json({ message: "Rekordazonosító megadása kötelező!" })

    try {
        const [result] = await pool.execute('CALL DeleteExpense(?)', [ id ])

        if(result.affectedRows > 0) {
            res.status(201).json({ message: "Rekord törölve." })
        } else {
            console.log(result)
            res.status(500).json({ message: "Sikertelen törlés." })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post('/expenses/edit', async (req, res) => {
    const {
        id,
        category,
        amount,
        description
    } = req.body

    if(!id) return res.status(400).json({ message: "Rekordazonosító megadása kötelező!" })
    if(!category) return res.status(400).json({ message: "Kategória megadása kötelező!" })
    if(!amount) return res.status(400).json({ message: "Összeg megadása kötelező!" })
    if(!description) return res.status(400).json({ message: "Leírás megadása kötelező!" })

    try {
        const [result] = await pool.execute('CALL EditExpense(?, ?, ?, ?)', [ category, amount, description, id ])

        if(result.affectedRows > 0) {
            res.status(201).json({ message: "Rekord frissítve." })
        } else {
            console.log(result)
            res.status(500).json({ message: "Sikertelen frissítés." })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.listen(3000, (req, res) => {
    console.log("Listening on port: 3000")
})