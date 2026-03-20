import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import db from './database';
import { Asset, CreateAssetInput } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 图片上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB限制
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 创建资产（带图片）
app.post('/api/assets', upload.single('image'), (req, res) => {
  try {
    const data: CreateAssetInput = req.body;
    const id = uuidv4();
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const stmt = db.prepare(`
      INSERT INTO assets (id, name, price, category, purchase_date, warranty_period, description, image_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.name,
      data.price || null,
      data.category || null,
      data.purchase_date || null,
      data.warranty_period || null,
      data.description || null,
      imagePath
    );

    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: '创建失败', details: (error as Error).message });
  }
});

// 获取所有资产（支持搜索和筛选）
app.get('/api/assets', (req, res) => {
  try {
    const { search, category, sortBy = 'created_at', order = 'desc' } = req.query;
    
    let query = 'SELECT * FROM assets WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    // 排序
    const allowedSortBy = ['created_at', 'price', 'name', 'purchase_date'];
    const sortField = allowedSortBy.includes(sortBy as string) ? sortBy : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const assets = db.prepare(query).all(...params);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: '查询失败', details: (error as Error).message });
  }
});

// 获取单个资产
app.get('/api/assets/:id', (req, res) => {
  try {
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: '未找到该物品' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: '查询失败', details: (error as Error).message });
  }
});

// 更新资产
app.put('/api/assets/:id', upload.single('image'), (req, res) => {
  try {
    const data = req.body;
    const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id) as Asset | undefined;
    
    if (!existing) {
      return res.status(404).json({ error: '未找到该物品' });
    }

    let imagePath = existing.image_path;
    if (req.file) {
      // 删除旧图片
      if (existing.image_path) {
        const oldPath = path.join(__dirname, '..', existing.image_path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    const stmt = db.prepare(`
      UPDATE assets SET 
        name = ?, price = ?, category = ?, purchase_date = ?, 
        warranty_period = ?, description = ?, image_path = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      data.name || existing.name,
      data.price !== undefined ? data.price : existing.price,
      data.category !== undefined ? data.category : existing.category,
      data.purchase_date !== undefined ? data.purchase_date : existing.purchase_date,
      data.warranty_period !== undefined ? data.warranty_period : existing.warranty_period,
      data.description !== undefined ? data.description : existing.description,
      imagePath,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: '更新失败', details: (error as Error).message });
  }
});

// 删除资产
app.delete('/api/assets/:id', (req, res) => {
  try {
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id) as Asset | undefined;
    
    if (!asset) {
      return res.status(404).json({ error: '未找到该物品' });
    }

    // 删除图片文件
    if (asset.image_path) {
      const imagePath = path.join(__dirname, '..', asset.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    db.prepare('DELETE FROM assets WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '删除失败', details: (error as Error).message });
  }
});

// 获取分类列表
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM assets WHERE category IS NOT NULL').all();
    res.json(categories.map((c: any) => c.category));
  } catch (error) {
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 统计信息
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(price), 0) as total_value,
        COUNT(DISTINCT category) as category_count
      FROM assets
    `).get();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '获取统计失败' });
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`服务器运行在 http://192.168.50.51:${PORT}`);
});