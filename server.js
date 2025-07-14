const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 서빙 (빌드된 React 앱)
app.use(express.static(path.join(__dirname, 'client/build')));

// 정적 파일 제공 (프로덕션용)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./debt_management.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
    initDatabase();
  }
});

// 데이터베이스 테이블 초기화
function initDatabase() {
  // 채무자 테이블
  db.run(`CREATE TABLE IF NOT EXISTS debtors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    debt_amount INTEGER NOT NULL,
    original_case_number TEXT,
    victory_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 강제집행 절차 테이블
  db.run(`CREATE TABLE IF NOT EXISTS enforcement_procedures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    debtor_id INTEGER,
    procedure_type TEXT NOT NULL CHECK(procedure_type IN ('통장압류', '재산명시', '급여압류')),
    case_number TEXT NOT NULL,
    application_date DATE,
    status TEXT DEFAULT '진행중' CHECK(status IN ('진행중', '완료', '중단')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (debtor_id) REFERENCES debtors (id) ON DELETE CASCADE
  )`);

  // 상환 기록 테이블
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    debtor_id INTEGER,
    amount INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (debtor_id) REFERENCES debtors (id) ON DELETE CASCADE
  )`);

  console.log('데이터베이스 테이블이 초기화되었습니다.');
}

// API 라우트들

// 모든 채무자 조회 (강제집행 절차 포함)
app.get('/api/debtors', (req, res) => {
  const query = `
    SELECT d.*, 
           COALESCE(SUM(p.amount), 0) as paid_amount,
           (d.debt_amount - COALESCE(SUM(p.amount), 0)) as remaining_amount
    FROM debtors d
    LEFT JOIN payments p ON d.id = p.debtor_id
    GROUP BY d.id
    ORDER BY d.created_at DESC
  `;
  
  db.all(query, [], (err, debtors) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // 각 채무자의 강제집행 절차 정보도 함께 가져오기
    const proceduresQuery = 'SELECT * FROM enforcement_procedures ORDER BY created_at DESC';
    db.all(proceduresQuery, [], (err, procedures) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // 채무자별로 강제집행 절차 정보 연결
      const debtorsWithProcedures = debtors.map(debtor => ({
        ...debtor,
        procedures: procedures.filter(proc => proc.debtor_id === debtor.id)
      }));
      
      res.json(debtorsWithProcedures);
    });
  });
});

// 특정 채무자 상세 조회
app.get('/api/debtors/:id', (req, res) => {
  const debtorId = req.params.id;
  
  const debtorQuery = `
    SELECT d.*, 
           COALESCE(SUM(p.amount), 0) as paid_amount,
           (d.debt_amount - COALESCE(SUM(p.amount), 0)) as remaining_amount
    FROM debtors d
    LEFT JOIN payments p ON d.id = p.debtor_id
    WHERE d.id = ?
    GROUP BY d.id
  `;
  
  db.get(debtorQuery, [debtorId], (err, debtor) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!debtor) {
      res.status(404).json({ error: '채무자를 찾을 수 없습니다.' });
      return;
    }
    
    // 강제집행 절차 조회
    const proceduresQuery = 'SELECT * FROM enforcement_procedures WHERE debtor_id = ? ORDER BY created_at DESC';
    db.all(proceduresQuery, [debtorId], (err, procedures) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // 상환 기록 조회
      const paymentsQuery = 'SELECT * FROM payments WHERE debtor_id = ? ORDER BY payment_date DESC';
      db.all(paymentsQuery, [debtorId], (err, payments) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({
          ...debtor,
          procedures,
          payments
        });
      });
    });
  });
});

// 새 채무자 추가
app.post('/api/debtors', (req, res) => {
  const { name, phone, address, debt_amount, original_case_number, victory_date, notes } = req.body;
  
  const query = `INSERT INTO debtors (name, phone, address, debt_amount, original_case_number, victory_date, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [name, phone, address, debt_amount, original_case_number, victory_date, notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '채무자가 성공적으로 추가되었습니다.' });
  });
});

// 채무자 정보 수정
app.put('/api/debtors/:id', (req, res) => {
  const { name, phone, address, debt_amount, original_case_number, victory_date, notes } = req.body;
  const debtorId = req.params.id;
  
  const query = `UPDATE debtors 
                 SET name = ?, phone = ?, address = ?, debt_amount = ?, 
                     original_case_number = ?, victory_date = ?, notes = ?,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;
  
  db.run(query, [name, phone, address, debt_amount, original_case_number, victory_date, notes, debtorId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '채무자 정보가 성공적으로 수정되었습니다.' });
  });
});

// 채무자 삭제
app.delete('/api/debtors/:id', (req, res) => {
  const debtorId = req.params.id;
  
  const query = 'DELETE FROM debtors WHERE id = ?';
  
  db.run(query, [debtorId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '채무자를 찾을 수 없습니다.' });
      return;
    }
    res.json({ message: '채무자가 성공적으로 삭제되었습니다.' });
  });
});

// 강제집행 절차 추가
app.post('/api/enforcement-procedures', (req, res) => {
  const { debtor_id, procedure_type, case_number, application_date, status, notes } = req.body;
  
  const query = `INSERT INTO enforcement_procedures (debtor_id, procedure_type, case_number, application_date, status, notes)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [debtor_id, procedure_type, case_number, application_date, status || '진행중', notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '강제집행 절차가 성공적으로 추가되었습니다.' });
  });
});

// 강제집행 절차 수정
app.put('/api/enforcement-procedures/:id', (req, res) => {
  const { procedure_type, case_number, application_date, status, notes } = req.body;
  const procedureId = req.params.id;
  
  const query = `UPDATE enforcement_procedures 
                 SET procedure_type = ?, case_number = ?, application_date = ?, 
                     status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;
  
  db.run(query, [procedure_type, case_number, application_date, status, notes, procedureId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '강제집행 절차를 찾을 수 없습니다.' });
      return;
    }
    res.json({ message: '강제집행 절차가 성공적으로 수정되었습니다.' });
  });
});

// 강제집행 절차 삭제
app.delete('/api/enforcement-procedures/:id', (req, res) => {
  const procedureId = req.params.id;
  
  const query = 'DELETE FROM enforcement_procedures WHERE id = ?';
  
  db.run(query, [procedureId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '강제집행 절차를 찾을 수 없습니다.' });
      return;
    }
    res.json({ message: '강제집행 절차가 성공적으로 삭제되었습니다.' });
  });
});

// 상환 기록 추가
app.post('/api/payments', (req, res) => {
  const { debtor_id, amount, payment_date, payment_method, notes } = req.body;
  
  const query = `INSERT INTO payments (debtor_id, amount, payment_date, payment_method, notes)
                 VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [debtor_id, amount, payment_date, payment_method, notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '상환 기록이 성공적으로 추가되었습니다.' });
  });
});

// 상환 기록 수정
app.put('/api/payments/:id', (req, res) => {
  const { amount, payment_date, payment_method, notes } = req.body;
  const paymentId = req.params.id;
  
  const query = `UPDATE payments 
                 SET amount = ?, payment_date = ?, payment_method = ?, notes = ?
                 WHERE id = ?`;
  
  db.run(query, [amount, payment_date, payment_method, notes, paymentId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '상환 기록을 찾을 수 없습니다.' });
      return;
    }
    res.json({ message: '상환 기록이 성공적으로 수정되었습니다.' });
  });
});

// 상환 기록 삭제
app.delete('/api/payments/:id', (req, res) => {
  const paymentId = req.params.id;
  
  const query = 'DELETE FROM payments WHERE id = ?';
  
  db.run(query, [paymentId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '상환 기록을 찾을 수 없습니다.' });
      return;
    }
    res.json({ message: '상환 기록이 성공적으로 삭제되었습니다.' });
  });
});

// 대시보드 통계 데이터
app.get('/api/dashboard-stats', (req, res) => {
  const statsQueries = {
    totalDebtors: 'SELECT COUNT(*) as count FROM debtors',
    totalDebtAmount: 'SELECT SUM(debt_amount) as total FROM debtors',
    totalPaidAmount: 'SELECT SUM(amount) as total FROM payments',
    activeProcedures: 'SELECT COUNT(*) as count FROM enforcement_procedures WHERE status = "진행중"'
  };
  
  const stats = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(statsQueries).length;
  
  Object.entries(statsQueries).forEach(([key, query]) => {
    db.get(query, [], (err, row) => {
      if (err) {
        console.error(`Error in ${key}:`, err);
        stats[key] = 0;
      } else {
        stats[key] = row.count || row.total || 0;
      }
      
      completedQueries++;
      if (completedQueries === totalQueries) {
        stats.remainingAmount = stats.totalDebtAmount - stats.totalPaidAmount;
        res.json(stats);
      }
    });
  });
});

// 모든 요청에 대해 React 앱 제공 (API 라우트가 아닌 경우)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`로컬 접속: http://localhost:${PORT}`);
  console.log(`네트워크 접속: http://172.30.1.9:${PORT}`);
});

// graceful shutdown
process.on('SIGINT', () => {
  console.log('\n서버를 종료합니다...');
  db.close((err) => {
    if (err) {
      console.error('데이터베이스 종료 오류:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
    process.exit(0);
  });
}); 