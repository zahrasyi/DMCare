import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// ==================== AUTH ROUTES ====================

// Sign up (create new user)
app.post('/make-server-12535b8b/auth/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (error) {
      console.log('Sign up error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user info in KV
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: role || 'student',
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Sign up error:', error);
    return c.json({ error: 'Sign up failed' }, 500);
  }
});

// ==================== STUDENT ROUTES ====================

// Create student
app.post('/make-server-12535b8b/students', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const studentData = await c.req.json();
    const studentId = `STU${Date.now()}`;
    
    const student = {
      id: studentId,
      ...studentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`student:${studentId}`, student);
    
    return c.json({ success: true, student });
  } catch (error) {
    console.log('Create student error:', error);
    return c.json({ error: 'Failed to create student' }, 500);
  }
});

// Get all students
app.get('/make-server-12535b8b/students', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const students = await kv.getByPrefix('student:');
    
    return c.json({ success: true, students });
  } catch (error) {
    console.log('Get students error:', error);
    return c.json({ error: 'Failed to get students' }, 500);
  }
});

// Get student by ID
app.get('/make-server-12535b8b/students/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const studentId = c.req.param('id');
    const student = await kv.get(`student:${studentId}`);
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    return c.json({ success: true, student });
  } catch (error) {
    console.log('Get student error:', error);
    return c.json({ error: 'Failed to get student' }, 500);
  }
});

// Update student
app.put('/make-server-12535b8b/students/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const studentId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingStudent = await kv.get(`student:${studentId}`);
    if (!existingStudent) {
      return c.json({ error: 'Student not found' }, 404);
    }

    const updatedStudent = {
      ...existingStudent,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`student:${studentId}`, updatedStudent);
    
    return c.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.log('Update student error:', error);
    return c.json({ error: 'Failed to update student' }, 500);
  }
});

// ==================== MEDICAL RECORDS ROUTES ====================

// Create medical record
app.post('/make-server-12535b8b/medical-records', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const recordData = await c.req.json();
    const recordId = `MR${Date.now()}`;
    
    const record = {
      id: recordId,
      ...recordData,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`medical-record:${recordId}`, record);
    
    return c.json({ success: true, record });
  } catch (error) {
    console.log('Create medical record error:', error);
    return c.json({ error: 'Failed to create medical record' }, 500);
  }
});

// Get medical records for a student
app.get('/make-server-12535b8b/medical-records/student/:studentId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const studentId = c.req.param('studentId');
    const allRecords = await kv.getByPrefix('medical-record:');
    
    const studentRecords = allRecords.filter((record) => record.studentId === studentId);
    studentRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return c.json({ success: true, records: studentRecords });
  } catch (error) {
    console.log('Get medical records error:', error);
    return c.json({ error: 'Failed to get medical records' }, 500);
  }
});

// ==================== SICK LEAVE ROUTES ====================

// Create sick leave
app.post('/make-server-12535b8b/sick-leave', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const leaveData = await c.req.json();
    const leaveId = `SL${Date.now()}`;
    
    const leave = {
      id: leaveId,
      ...leaveData,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`sick-leave:${leaveId}`, leave);
    
    return c.json({ success: true, leave });
  } catch (error) {
    console.log('Create sick leave error:', error);
    return c.json({ error: 'Failed to create sick leave' }, 500);
  }
});

// Get all sick leaves (with optional status filter)
app.get('/make-server-12535b8b/sick-leave', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const status = c.req.query('status');
    const allLeaves = await kv.getByPrefix('sick-leave:');
    
    let leaves = allLeaves;
    if (status) {
      leaves = allLeaves.filter((leave) => leave.status === status);
    }
    
    // Sort by start date descending
    leaves.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    return c.json({ success: true, leaves });
  } catch (error) {
    console.log('Get sick leaves error:', error);
    return c.json({ error: 'Failed to get sick leaves' }, 500);
  }
});

// Update sick leave status
app.put('/make-server-12535b8b/sick-leave/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const leaveId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingLeave = await kv.get(`sick-leave:${leaveId}`);
    if (!existingLeave) {
      return c.json({ error: 'Sick leave not found' }, 404);
    }

    const updatedLeave = {
      ...existingLeave,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`sick-leave:${leaveId}`, updatedLeave);
    
    return c.json({ success: true, leave: updatedLeave });
  } catch (error) {
    console.log('Update sick leave error:', error);
    return c.json({ error: 'Failed to update sick leave' }, 500);
  }
});

// ==================== MEDICINE ROUTES ====================

// Create medicine
app.post('/make-server-12535b8b/medicine', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const medicineData = await c.req.json();
    const medicineId = `MED${Date.now()}`;
    
    const medicine = {
      id: medicineId,
      ...medicineData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`medicine:${medicineId}`, medicine);
    
    return c.json({ success: true, medicine });
  } catch (error) {
    console.log('Create medicine error:', error);
    return c.json({ error: 'Failed to create medicine' }, 500);
  }
});

// Get all medicines
app.get('/make-server-12535b8b/medicine', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const medicines = await kv.getByPrefix('medicine:');
    
    return c.json({ success: true, medicines });
  } catch (error) {
    console.log('Get medicines error:', error);
    return c.json({ error: 'Failed to get medicines' }, 500);
  }
});

// Update medicine stock
app.put('/make-server-12535b8b/medicine/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const medicineId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingMedicine = await kv.get(`medicine:${medicineId}`);
    if (!existingMedicine) {
      return c.json({ error: 'Medicine not found' }, 404);
    }

    const updatedMedicine = {
      ...existingMedicine,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`medicine:${medicineId}`, updatedMedicine);
    
    return c.json({ success: true, medicine: updatedMedicine });
  } catch (error) {
    console.log('Update medicine error:', error);
    return c.json({ error: 'Failed to update medicine' }, 500);
  }
});

// Create medicine transaction (in/out)
app.post('/make-server-12535b8b/medicine-transactions', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { medicineId, type, quantity, notes } = await c.req.json();
    const transactionId = `MT${Date.now()}`;
    
    // Get current medicine
    const medicine = await kv.get(`medicine:${medicineId}`);
    if (!medicine) {
      return c.json({ error: 'Medicine not found' }, 404);
    }

    // Update stock
    const newStock = type === 'in' 
      ? medicine.stock + quantity 
      : medicine.stock - quantity;

    if (newStock < 0) {
      return c.json({ error: 'Insufficient stock' }, 400);
    }

    await kv.set(`medicine:${medicineId}`, {
      ...medicine,
      stock: newStock,
      updatedAt: new Date().toISOString(),
    });

    // Create transaction record
    const transaction = {
      id: transactionId,
      medicineId,
      medicineName: medicine.name,
      type,
      quantity,
      notes,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`medicine-transaction:${transactionId}`, transaction);
    
    return c.json({ success: true, transaction, newStock });
  } catch (error) {
    console.log('Create medicine transaction error:', error);
    return c.json({ error: 'Failed to create transaction' }, 500);
  }
});

// Get medicine transactions
app.get('/make-server-12535b8b/medicine-transactions', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const transactions = await kv.getByPrefix('medicine-transaction:');
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ success: true, transactions });
  } catch (error) {
    console.log('Get medicine transactions error:', error);
    return c.json({ error: 'Failed to get transactions' }, 500);
  }
});

// ==================== HEALTH REPORTS ROUTES ====================

// Get health statistics
app.get('/make-server-12535b8b/reports/statistics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const month = c.req.query('month') || new Date().getMonth() + 1;
    const year = c.req.query('year') || new Date().getFullYear();

    // Get all medical records
    const allRecords = await kv.getByPrefix('medical-record:');
    
    // Filter by month/year
    const monthRecords = allRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() + 1 === parseInt(month) && 
             recordDate.getFullYear() === parseInt(year);
    });

    // Count diagnoses
    const diagnosisCounts: Record<string, number> = {};
    monthRecords.forEach((record) => {
      const diagnosis = record.diagnosis || 'Unknown';
      diagnosisCounts[diagnosis] = (diagnosisCounts[diagnosis] || 0) + 1;
    });

    // Get top illnesses
    const topIllnesses = Object.entries(diagnosisCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get sick leave stats
    const allLeaves = await kv.getByPrefix('sick-leave:');
    const activeLeaves = allLeaves.filter((leave) => leave.status === 'active');

    // Get total students
    const students = await kv.getByPrefix('student:');

    const statistics = {
      month,
      year,
      totalVisits: monthRecords.length,
      totalStudents: students.length,
      activeSickLeaves: activeLeaves.length,
      topIllnesses,
      monthRecords: monthRecords.length,
    };
    
    return c.json({ success: true, statistics });
  } catch (error) {
    console.log('Get statistics error:', error);
    return c.json({ error: 'Failed to get statistics' }, 500);
  }
});

Deno.serve(app.fetch);
