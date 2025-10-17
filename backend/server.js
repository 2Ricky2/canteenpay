const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve local images (food pictures)
app.use('/images', express.static(path.join(__dirname, 'images')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mdb'
});

db.connect(err => {
  if (err) {
    console.error('❌ DB connection failed:', err);
  } else {
    console.log('✅ MySQL Connected');
  }
});


// =========================
// 🔐 AUTHENTICATION ROUTES
// =========================

// ✅ SIGNUP
app.post('/signup', async (req, res) => {
  const { user_name, user_email, user_pass } = req.body;
  if (!user_name || !user_email || !user_pass) {
    return res.json({ success: false, message: 'All fields required' });
  }

  db.query('SELECT * FROM users WHERE user_email = ?', [user_email], async (err, results) => {
    if (err) return res.json({ success: false, message: 'DB error' });
    if (results.length > 0)
      return res.json({ success: false, message: 'Email already exists' });

    const hashed = await bcrypt.hash(user_pass, 10);
    db.query(
      'INSERT INTO users (user_name, user_email, user_pass, role, wallet) VALUES (?, ?, ?, ?, ?)',
      [user_name, user_email, hashed, 'user', 0.00],
      err2 => {
        if (err2)
          return res.json({ success: false, message: 'Insert error' });
        return res.json({ success: true, message: 'User created successfully' });
      }
    );
  });
});


// ✅ LOGIN
app.post('/login', (req, res) => {
  const { user_email, user_pass } = req.body;
  if (!user_email || !user_pass)
    return res.json({ success: false, message: 'All fields required' });

  db.query('SELECT * FROM users WHERE user_email = ?', [user_email], async (err, results) => {
    if (err) return res.json({ success: false, message: 'DB error' });
    if (results.length === 0)
      return res.json({ success: false, message: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(user_pass, user.user_pass);
    if (!isMatch)
      return res.json({ success: false, message: 'Invalid password' });

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.user_id,
        username: user.user_name,
        email: user.user_email,
        role: user.role,
        wallet: user.wallet || 0.00,
      }
    });
  });
});


// =========================
// 🍔 MENU ITEMS / INVENTORY
// =========================

// ✅ Get all menu items
app.get('/menu', (req, res) => {
  db.query('SELECT * FROM menu_items', (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: 'DB fetch error' });
    }
    res.json({ success: true, menu: results });
  });
});

// ✅ Add a new menu item
app.post('/menu', (req, res) => {
  const { name, category, price, image_url, quantity } = req.body;
  if (!name || !category || !price) {
    return res.json({ success: false, message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO menu_items (name, category, price, image_url, quantity) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, category, price, image_url || '', quantity || 0], (err) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: 'DB insert error' });
    }
    res.json({ success: true, message: 'Item added successfully' });
  });
});

// ✅ Update a menu item
app.put('/menu/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, price, image_url, quantity } = req.body;

  const sql = `
    UPDATE menu_items 
    SET name=?, category=?, price=?, image_url=?, quantity=? 
    WHERE id=?`;
  
  db.query(sql, [name, category, price, image_url || '', quantity || 0, id], (err) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: 'DB update error' });
    }
    res.json({ success: true, message: 'Item updated successfully' });
  });
});

// ✅ Delete a menu item
app.delete('/menu/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM menu_items WHERE id=?', [id], err => {
    if (err) return res.json({ success: false, message: 'Delete failed' });
    res.json({ success: true, message: 'Food item deleted successfully' });
  });
});


// =========================
// 👥 ADMIN: USERS MANAGEMENT
// =========================

// ✅ Fetch all users
app.get('/users', (req, res) => {
  db.query(
    'SELECT user_id, user_name, user_email, role, wallet FROM users',
    (err, results) => {
      if (err) return res.json({ success: false, message: 'DB error' });
      res.json({ success: true, users: results });
    }
  );
});
// ✅ UPDATE user info
app.put('/users/:id', (req, res) => {
  const { user_name, role, wallet } = req.body;
  const { id } = req.params;

  const sql = 'UPDATE users SET user_name=?, role=?, wallet=? WHERE user_id=?';
  db.query(sql, [user_name, role, wallet, id], err => {
    if (err) return res.json({ success: false, message: 'DB update error' });
    res.json({ success: true, message: 'User updated' });
  });
});

// ✅ Delete a user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE user_id = ?', [id], err => {
    if (err) return res.json({ success: false, message: 'Delete failed' });
    res.json({ success: true, message: 'User deleted successfully' });
  });
});

const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'images') });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, filename: req.file.filename });
});


// ✅ PLACE ORDER
app.post('/order', (req, res) => {
  const { user_id, menu_id } = req.body;
  if (!user_id || !menu_id)
    return res.json({ success: false, message: 'Missing data' });

  db.query('SELECT * FROM menu_items WHERE id = ?', [menu_id], (err, results) => {
    if (err || results.length === 0) return res.json({ success: false, message: 'Food not found' });

    const item = results[0];
    if (item.quantity <= 0) return res.json({ success: false, message: 'Out of stock' });

    const totalPrice = item.price;

    // ✅ Reduce stock
    db.query('UPDATE menu_items SET quantity = quantity - 1 WHERE id = ?', [menu_id]);

    // ✅ Create order
    db.query(
      'INSERT INTO orders (user_id, menu_id, quantity, total_price) VALUES (?, ?, ?, ?)',
      [user_id, menu_id, 1, totalPrice],
      (err2) => {
        if (err2) return res.json({ success: false, message: 'Failed to order' });
        res.json({ success: true, message: 'Order placed successfully!' });
      }
    );
  });
});

// ✅ FETCH USER’S ACTIVE ORDERS (with quantity)
app.get('/orders/:user_id', (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT o.id,  o.status,  o.quantity, o.total_price, m.name AS food_name, m.price, m.image_url
    FROM orders o
    JOIN menu_items m ON o.menu_id = m.id
    WHERE o.user_id = ? AND o.status = "Active"
    ORDER BY o.id DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: 'DB error' });
    }
    res.json({ success: true, orders: results });
  });
});


// ✅ Update an order’s status (used by admin)
app.put('/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.json({ success: false, message: 'Missing status' });

  const validStatuses = ['Active', 'Paid', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status))
    return res.json({ success: false, message: 'Invalid status value' });

  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(sql, [status, id], err => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: 'Database update error' });
    }
    res.json({ success: true, message: `Order marked as ${status}` });
  });
});








// =========================
// 🚀 START SERVER
// =========================
app.listen(3000, '0.0.0.0', () =>
  console.log('✅ Server running on http://localhost:3000')
);
