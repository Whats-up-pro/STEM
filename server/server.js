import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(join(__dirname, '..')));

// ==================== API ENDPOINTS ====================

// 1. Đăng ký/Đăng nhập học sinh
app.post('/api/student/register', (req, res) => {
  const { student_id, name, class: className } = req.body;
  
  if (!student_id || !name) {
    return res.status(400).json({ error: 'student_id và name là bắt buộc' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO students (student_id, name, class) 
      VALUES (?, ?, ?)
      ON CONFLICT(student_id) DO UPDATE SET
        name = excluded.name,
        class = excluded.class
    `);
    
    stmt.run(student_id, name, className || '');
    
    res.json({ 
      success: true, 
      message: 'Đăng ký thành công',
      student: { student_id, name, class: className }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Bắt đầu session học
app.post('/api/session/start', (req, res) => {
  const { student_id, session_id } = req.body;
  
  if (!student_id || !session_id) {
    return res.status(400).json({ error: 'student_id và session_id là bắt buộc' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO sessions (student_id, session_id, start_time, is_active)
      VALUES (?, ?, datetime('now'), 1)
    `);
    
    stmt.run(student_id, session_id);
    
    res.json({ 
      success: true, 
      message: 'Session bắt đầu',
      session_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Gửi dữ liệu tập trung (realtime)
app.post('/api/focus/send', (req, res) => {
  const { session_id, state, focus, distracted, sleepy } = req.body;
  
  if (!session_id || !state) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }

  try {
    // Lưu dữ liệu focus
    const stmt = db.prepare(`
      INSERT INTO focus_data (session_id, timestamp, state, focus_percentage, distracted_percentage, sleepy_percentage)
      VALUES (?, datetime('now'), ?, ?, ?, ?)
    `);
    
    stmt.run(session_id, state, focus || 0, distracted || 0, sleepy || 0);
    
    // Kiểm tra nếu focus < 60% thì tạo alert
    if (focus < 60) {
      const alertStmt = db.prepare(`
        INSERT INTO alerts (session_id, alert_type, message, focus_percentage, timestamp)
        VALUES (?, 'LOW_FOCUS', ?, ?, datetime('now'))
      `);
      
      alertStmt.run(
        session_id, 
        `Mất tập trung! Focus: ${focus.toFixed(1)}%`,
        focus
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Kết thúc session
app.post('/api/session/end', (req, res) => {
  const { session_id } = req.body;
  
  if (!session_id) {
    return res.status(400).json({ error: 'session_id là bắt buộc' });
  }

  try {
    // Cập nhật session
    const updateStmt = db.prepare(`
      UPDATE sessions 
      SET end_time = datetime('now'),
          is_active = 0,
          total_duration = (julianday(datetime('now')) - julianday(start_time)) * 86400
      WHERE session_id = ?
    `);
    updateStmt.run(session_id);
    
    // Tính toán summary
    const summaryData = db.prepare(`
      SELECT 
        AVG(focus_percentage) as avg_focus,
        AVG(distracted_percentage) as avg_distracted,
        AVG(sleepy_percentage) as avg_sleepy,
        COUNT(*) as total_records
      FROM focus_data
      WHERE session_id = ?
    `).get(session_id);
    
    const alertCount = db.prepare(`
      SELECT COUNT(*) as count FROM alerts WHERE session_id = ?
    `).get(session_id).count;
    
    const sessionInfo = db.prepare(`
      SELECT student_id FROM sessions WHERE session_id = ?
    `).get(session_id);
    
    // Đánh giá mức độ focus
    let rating = 'Xuất sắc';
    if (summaryData.avg_focus < 60) rating = 'Cần cải thiện';
    else if (summaryData.avg_focus < 75) rating = 'Khá';
    else if (summaryData.avg_focus < 85) rating = 'Tốt';
    
    // Lưu summary
    const summaryStmt = db.prepare(`
      INSERT INTO session_summary 
      (session_id, student_id, avg_focus, avg_distracted, avg_sleepy, total_alerts, focus_rating)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    summaryStmt.run(
      session_id,
      sessionInfo.student_id,
      summaryData.avg_focus,
      summaryData.avg_distracted,
      summaryData.avg_sleepy,
      alertCount,
      rating
    );
    
    res.json({ 
      success: true,
      summary: {
        avg_focus: summaryData.avg_focus.toFixed(2),
        rating,
        total_alerts: alertCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Lấy danh sách học sinh đang online
app.get('/api/teacher/active-students', (req, res) => {
  try {
    const students = db.prepare(`
      SELECT 
        s.student_id,
        st.name,
        st.class,
        s.session_id,
        s.start_time,
        ROUND((julianday(datetime('now')) - julianday(s.start_time)) * 1440, 1) as minutes_online
      FROM sessions s
      JOIN students st ON s.student_id = st.student_id
      WHERE s.is_active = 1
      ORDER BY s.start_time DESC
    `).all();
    
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Lấy dữ liệu realtime của 1 học sinh
app.get('/api/teacher/student/:session_id/live', (req, res) => {
  const { session_id } = req.params;
  
  try {
    // Lấy 60 dữ liệu gần nhất (1 phút)
    const focusData = db.prepare(`
      SELECT 
        timestamp,
        state,
        focus_percentage,
        distracted_percentage,
        sleepy_percentage
      FROM focus_data
      WHERE session_id = ?
      ORDER BY timestamp DESC
      LIMIT 60
    `).all(session_id);
    
    // Tính % hiện tại
    const current = focusData[0] || null;
    
    res.json({ 
      session_id,
      current,
      history: focusData.reverse()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Lấy alerts gần đây
app.get('/api/teacher/alerts', (req, res) => {
  const limit = req.query.limit || 50;
  
  try {
    const alerts = db.prepare(`
      SELECT 
        a.id,
        a.session_id,
        a.alert_type,
        a.message,
        a.focus_percentage,
        a.timestamp,
        s.student_id,
        st.name
      FROM alerts a
      JOIN sessions s ON a.session_id = s.session_id
      JOIN students st ON s.student_id = st.student_id
      WHERE s.is_active = 1
      ORDER BY a.timestamp DESC
      LIMIT ?
    `).all(limit);
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Lấy lịch sử sessions của học sinh
app.get('/api/teacher/student/:student_id/history', (req, res) => {
  const { student_id } = req.params;
  
  try {
    const sessions = db.prepare(`
      SELECT 
        s.session_id,
        s.start_time,
        s.end_time,
        s.total_duration,
        s.is_active,
        sm.avg_focus,
        sm.avg_distracted,
        sm.avg_sleepy,
        sm.total_alerts,
        sm.focus_rating
      FROM sessions s
      LEFT JOIN session_summary sm ON s.session_id = sm.session_id
      WHERE s.student_id = ?
      ORDER BY s.start_time DESC
      LIMIT 20
    `).all(student_id);
    
    res.json({ student_id, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Dashboard stats tổng quan
app.get('/api/teacher/dashboard-stats', (req, res) => {
  try {
    const stats = {
      total_students: db.prepare('SELECT COUNT(*) as count FROM students').get().count,
      active_now: db.prepare('SELECT COUNT(*) as count FROM sessions WHERE is_active = 1').get().count,
      total_sessions_today: db.prepare(`
        SELECT COUNT(*) as count FROM sessions 
        WHERE DATE(start_time) = DATE('now')
      `).get().count,
      alerts_today: db.prepare(`
        SELECT COUNT(*) as count FROM alerts 
        WHERE DATE(timestamp) = DATE('now')
      `).get().count
    };
    
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   🚀 StudyWatch Server                         ║
║   📡 Server đang chạy tại: http://localhost:${PORT}  ║
║   📊 Teacher Dashboard: /teacher-dashboard.html║
║   🎓 Student App: /index.html                  ║
╚════════════════════════════════════════════════╝
  `);
});
