// Vercel Serverless Function for StudyWatch
// ⚠️ LƯU Ý: Phiên bản này dùng in-memory storage
// Data sẽ mất khi function restart (cold start)
// Để persistent data, upgrade lên Vercel Postgres

const cors = require('cors');

// In-memory storage (thay vì SQLite)
const storage = {
  students: new Map(),
  sessions: new Map(),
  focusData: new Map(),
  alerts: new Map(),
  summary: new Map()
};

// Helper function to parse request body
async function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

// CORS middleware
function enableCors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Main handler
module.exports = async (req, res) => {
  enableCors(res);
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  const urlPath = url.split('?')[0];

  try {
    // Route handlers
    
    // 1. POST /api/student/register
    if (urlPath === '/api/student/register' && method === 'POST') {
      const body = await parseBody(req);
      const { student_id, name, class: className } = body;
      
      if (!student_id || !name) {
        return res.status(400).json({ error: 'student_id và name là bắt buộc' });
      }

      storage.students.set(student_id, {
        student_id,
        name,
        class: className || '',
        created_at: new Date().toISOString()
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Đăng ký thành công',
        student: { student_id, name, class: className }
      });
    }

    // 2. POST /api/session/start
    if (urlPath === '/api/session/start' && method === 'POST') {
      const body = await parseBody(req);
      const { student_id, session_id } = body;
      
      if (!student_id || !session_id) {
        return res.status(400).json({ error: 'student_id và session_id là bắt buộc' });
      }

      storage.sessions.set(session_id, {
        student_id,
        session_id,
        start_time: new Date().toISOString(),
        end_time: null,
        is_active: true,
        total_duration: 0
      });
      
      // Initialize arrays for this session
      storage.focusData.set(session_id, []);
      storage.alerts.set(session_id, []);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Session bắt đầu',
        session_id
      });
    }

    // 3. POST /api/focus/send
    if (urlPath === '/api/focus/send' && method === 'POST') {
      const body = await parseBody(req);
      const { session_id, state, focus, distracted, sleepy } = body;
      
      if (!session_id || !state) {
        return res.status(400).json({ error: 'Thiếu dữ liệu' });
      }

      const focusArray = storage.focusData.get(session_id) || [];
      focusArray.push({
        timestamp: new Date().toISOString(),
        state,
        focus_percentage: focus || 0,
        distracted_percentage: distracted || 0,
        sleepy_percentage: sleepy || 0
      });
      
      // Keep only last 1000 records per session
      if (focusArray.length > 1000) {
        focusArray.shift();
      }
      
      storage.focusData.set(session_id, focusArray);
      
      // Create alert if focus < 60%
      if (focus < 60) {
        const alertsArray = storage.alerts.get(session_id) || [];
        alertsArray.push({
          alert_type: 'LOW_FOCUS',
          message: `Mất tập trung! Focus: ${focus.toFixed(1)}%`,
          focus_percentage: focus,
          timestamp: new Date().toISOString()
        });
        storage.alerts.set(session_id, alertsArray);
      }
      
      return res.status(200).json({ success: true });
    }

    // 4. POST /api/session/end
    if (urlPath === '/api/session/end' && method === 'POST') {
      const body = await parseBody(req);
      const { session_id } = body;
      
      if (!session_id) {
        return res.status(400).json({ error: 'session_id là bắt buộc' });
      }

      const session = storage.sessions.get(session_id);
      if (!session) {
        return res.status(404).json({ error: 'Session không tồn tại' });
      }

      // Update session
      const endTime = new Date();
      const startTime = new Date(session.start_time);
      const duration = Math.floor((endTime - startTime) / 1000); // seconds
      
      session.end_time = endTime.toISOString();
      session.is_active = false;
      session.total_duration = duration;
      storage.sessions.set(session_id, session);
      
      // Calculate summary
      const focusArray = storage.focusData.get(session_id) || [];
      const alertsArray = storage.alerts.get(session_id) || [];
      
      let avg_focus = 0, avg_distracted = 0, avg_sleepy = 0;
      
      if (focusArray.length > 0) {
        avg_focus = focusArray.reduce((sum, d) => sum + d.focus_percentage, 0) / focusArray.length;
        avg_distracted = focusArray.reduce((sum, d) => sum + d.distracted_percentage, 0) / focusArray.length;
        avg_sleepy = focusArray.reduce((sum, d) => sum + d.sleepy_percentage, 0) / focusArray.length;
      }
      
      let rating = 'Xuất sắc';
      if (avg_focus < 60) rating = 'Cần cải thiện';
      else if (avg_focus < 75) rating = 'Khá';
      else if (avg_focus < 85) rating = 'Tốt';
      
      storage.summary.set(session_id, {
        session_id,
        student_id: session.student_id,
        avg_focus,
        avg_distracted,
        avg_sleepy,
        total_alerts: alertsArray.length,
        focus_rating: rating,
        created_at: new Date().toISOString()
      });
      
      return res.status(200).json({ 
        success: true,
        summary: {
          avg_focus: avg_focus.toFixed(2),
          rating,
          total_alerts: alertsArray.length
        }
      });
    }

    // 5. GET /api/teacher/active-students
    if (urlPath === '/api/teacher/active-students' && method === 'GET') {
      const students = [];
      
      for (const [session_id, session] of storage.sessions.entries()) {
        if (session.is_active) {
          const student = storage.students.get(session.student_id);
          const startTime = new Date(session.start_time);
          const now = new Date();
          const minutes_online = ((now - startTime) / 1000 / 60).toFixed(1);
          
          students.push({
            student_id: session.student_id,
            name: student?.name || 'Unknown',
            class: student?.class || '',
            session_id,
            start_time: session.start_time,
            minutes_online: parseFloat(minutes_online)
          });
        }
      }
      
      return res.status(200).json({ students });
    }

    // 6. GET /api/teacher/student/:session_id/live
    if (urlPath.startsWith('/api/teacher/student/') && urlPath.endsWith('/live') && method === 'GET') {
      const session_id = urlPath.split('/')[4];
      
      const focusArray = storage.focusData.get(session_id) || [];
      const recent = focusArray.slice(-60).reverse(); // Last 60 records
      const current = recent[0] || null;
      
      return res.status(200).json({ 
        session_id,
        current,
        history: recent.reverse()
      });
    }

    // 7. GET /api/teacher/alerts
    if (urlPath === '/api/teacher/alerts' && method === 'GET') {
      const allAlerts = [];
      
      for (const [session_id, alertsArray] of storage.alerts.entries()) {
        const session = storage.sessions.get(session_id);
        if (session && session.is_active) {
          const student = storage.students.get(session.student_id);
          
          for (const alert of alertsArray) {
            allAlerts.push({
              session_id,
              student_id: session.student_id,
              name: student?.name || 'Unknown',
              ...alert
            });
          }
        }
      }
      
      // Sort by timestamp descending
      allAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      const limit = parseInt(req.query?.limit) || 50;
      return res.status(200).json({ alerts: allAlerts.slice(0, limit) });
    }

    // 8. GET /api/teacher/student/:student_id/history
    if (urlPath.startsWith('/api/teacher/student/') && urlPath.endsWith('/history') && method === 'GET') {
      const student_id = urlPath.split('/')[4];
      
      const sessions = [];
      for (const [session_id, session] of storage.sessions.entries()) {
        if (session.student_id === student_id) {
          const summaryData = storage.summary.get(session_id);
          sessions.push({
            session_id,
            start_time: session.start_time,
            end_time: session.end_time,
            total_duration: session.total_duration,
            is_active: session.is_active,
            ...summaryData
          });
        }
      }
      
      // Sort by start_time descending
      sessions.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      
      return res.status(200).json({ 
        student_id, 
        sessions: sessions.slice(0, 20) 
      });
    }

    // 9. GET /api/teacher/dashboard-stats
    if (urlPath === '/api/teacher/dashboard-stats' && method === 'GET') {
      let active_now = 0;
      let total_sessions_today = 0;
      let alerts_today = 0;
      
      const today = new Date().toDateString();
      
      for (const session of storage.sessions.values()) {
        if (session.is_active) active_now++;
        
        const sessionDate = new Date(session.start_time).toDateString();
        if (sessionDate === today) total_sessions_today++;
      }
      
      for (const alertsArray of storage.alerts.values()) {
        for (const alert of alertsArray) {
          const alertDate = new Date(alert.timestamp).toDateString();
          if (alertDate === today) alerts_today++;
        }
      }
      
      return res.status(200).json({ 
        stats: {
          total_students: storage.students.size,
          active_now,
          total_sessions_today,
          alerts_today
        }
      });
    }

    // Default: 404
    return res.status(404).json({ error: 'Endpoint không tồn tại' });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
