require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const mongoose = require('mongoose');
const Category = require('./models/Category');

const app = express();
app.use(bodyParser.json());

// الاتصال بقاعدة بيانات MySQL
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// الاتصال بقاعدة بيانات MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.log(err));

// إنشاء الفئة في MySQL وMongoDB
app.post('/Create_Category', async (req, res) => {
    const { name } = req.body;

    db.query('INSERT INTO categories (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const newCategory = new Category({ name });
        newCategory.save()
            .then(() => res.status(201).json({ message: 'Category added!' }))
            .catch(err => res.status(500).json({ error: err.message }));
    });
});

// جلب جميع الفئات
app.get('/GetAllCategories', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// تحديث الفئة
app.put('/Update_Category/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    db.query('UPDATE categories SET name = ? WHERE id = ?', [name, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Category updated!' });
    });
});

// جلب فئة معينة حسب ID
app.get('/GetCategoryByBId/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM categories WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// حذف فئة معينة حسب ID
app.delete('/DleteCategoryByBId/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM categories WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Category deleted!' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
