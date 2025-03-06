// src/lib/db-helpers.ts
import clientPromise from './mongodb';
import { Db, ObjectId } from 'mongodb';
import { Application, Department, Notification, UserModel, Counter } from '@/types/mongo';

// Database and collection names
const DB_NAME = 'entrance-exam-app';
const COLLECTIONS = {
  USERS: 'users',
  APPLICATIONS: 'applications',
  DEPARTMENTS: 'departments',
  NOTIFICATIONS: 'notifications',
  COUNTERS: 'counters',
};

// Helper to get the database instance
async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// Get the next sequence number for application numbers
export async function getNextSequence(name: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.collection<Counter>(COLLECTIONS.COUNTERS).findOneAndUpdate(
    { name: name },
    { $inc: { sequence: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  
  return result.sequence;
}

// Generate a formatted application number
export async function generateApplicationNumber(): Promise<string> {
  const sequence = await getNextSequence('applicationNo');
  const year = new Date().getFullYear();
  return `EXM${year}${sequence.toString().padStart(4, '0')}`;
}

// User functions
export async function createOrUpdateUser(userData: UserModel): Promise<UserModel> {
  const db = await getDatabase();
  const users = db.collection<UserModel>(COLLECTIONS.USERS);
  
  // Try to find existing user by Firebase UID
  const existingUser = await users.findOne({ uid: userData.uid });
  
  if (existingUser) {
    // Update existing user
    const { _id, ...userDataWithoutId } = userData;
    await users.updateOne(
      { uid: userData.uid },
      { $set: { ...userDataWithoutId, updatedAt: Date.now() } }
    );
    return { ...existingUser, ...userDataWithoutId, updatedAt: Date.now() };
  } else {
    // Create new user
    const newUser = {
      ...userData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await users.insertOne(newUser);
    return newUser;
  }
}

export async function getUserByUid(uid: string): Promise<UserModel | null> {
  const db = await getDatabase();
  return db.collection<UserModel>(COLLECTIONS.USERS).findOne({ uid });
}

// Application functions
export async function createApplication(application: Application): Promise<Application> {
  const db = await getDatabase();
  
  // Generate unique application number if not provided
  if (!application.applicationNo) {
    application.applicationNo = await generateApplicationNumber();
  }
  
  // Set timestamps
  if (!application.status.appliedAt) {
    application.status.appliedAt = Date.now();
  }
  application.status.updatedAt = Date.now();
  
  await db.collection<Application>(COLLECTIONS.APPLICATIONS).insertOne(application);
  return application;
}

export async function updateApplication(
  applicationId: string,
  updates: Partial<Application>
): Promise<Application | null> {
  const db = await getDatabase();
  const applications = db.collection<Application>(COLLECTIONS.APPLICATIONS);
  
  // Set updated timestamp
  updates.status = {
    ...updates.status,
    updatedAt: Date.now(),
  };
  
  const result = await applications.findOneAndUpdate(
    { _id: new ObjectId(applicationId) },
    { $set: updates },
    { returnDocument: 'after' }
  );
  
  return result || null;
}

export async function getApplicationById(applicationId: string): Promise<Application | null> {
  const db = await getDatabase();
  return db.collection<Application>(COLLECTIONS.APPLICATIONS).findOne(
    { _id: new ObjectId(applicationId) }
  );
}

export async function getApplicationByNumber(applicationNo: string): Promise<Application | null> {
  const db = await getDatabase();
  return db.collection<Application>(COLLECTIONS.APPLICATIONS).findOne({ applicationNo });
}

export async function getApplicationsByUserId(userId: string): Promise<Application[]> {
  const db = await getDatabase();
  return db.collection<Application>(COLLECTIONS.APPLICATIONS)
    .find({ userId })
    .sort({ 'status.appliedAt': -1 })
    .toArray();
}

export async function getAllApplications(
  filters: Record<string, any> = {},
  page: number = 1,
  limit: number = 10
): Promise<{ applications: Application[], total: number }> {
  const db = await getDatabase();
  const collection = db.collection<Application>(COLLECTIONS.APPLICATIONS);
  
  const skip = (page - 1) * limit;
  const applications = await collection
    .find(filters)
    .sort({ 'status.appliedAt': -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  
  const total = await collection.countDocuments(filters);
  
  return { applications, total };
}

export async function getApplicationStats(): Promise<{
  total: number;
  approved: number;
  disapproved: number;
  qualified: number;
  disqualified: number;
}> {
  const db = await getDatabase();
  const collection = db.collection<Application>(COLLECTIONS.APPLICATIONS);
  
  const total = await collection.countDocuments();
  const approved = await collection.countDocuments({ 'status.isApproved': true });
  const disapproved = await collection.countDocuments({
    'status.isApproved': false,
    'status.reviewedAt': { $exists: true }
  });
  const qualified = await collection.countDocuments({ 'status.isQualified': true });
  const disqualified = await collection.countDocuments({
    'status.isQualified': false,
    'status.reviewedAt': { $exists: true }
  });
  
  return { total, approved, disapproved, qualified, disqualified };
}

// Department functions
export async function createDepartment(department: Department): Promise<Department> {
  const db = await getDatabase();
  
  // Set timestamps
  department.createdAt = Date.now();
  department.updatedAt = Date.now();
  
  await db.collection<Department>(COLLECTIONS.DEPARTMENTS).insertOne(department);
  return department;
}

export async function updateDepartment(
  departmentId: string,
  updates: Partial<Department>
): Promise<Department | null> {
  const db = await getDatabase();
  
  // Set updated timestamp
  updates.updatedAt = Date.now();
  
  const result = await db.collection<Department>(COLLECTIONS.DEPARTMENTS).findOneAndUpdate(
    { _id: new ObjectId(departmentId) },
    { $set: updates },
    { returnDocument: 'after' }
  );
  
  return result || null;
}

export async function deleteDepartment(departmentId: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.collection<Department>(COLLECTIONS.DEPARTMENTS).deleteOne(
    { _id: new ObjectId(departmentId) }
  );
  
  return result.deletedCount > 0;
}

export async function getDepartmentById(departmentId: string): Promise<Department | null> {
  const db = await getDatabase();
  return db.collection<Department>(COLLECTIONS.DEPARTMENTS).findOne(
    { _id: new ObjectId(departmentId) }
  );
}

export async function getAllDepartments(): Promise<Department[]> {
  const db = await getDatabase();
  return db.collection<Department>(COLLECTIONS.DEPARTMENTS)
    .find()
    .sort({ name: 1 })
    .toArray();
}

// Notification functions
export async function createNotification(notification: Notification): Promise<Notification> {
  const db = await getDatabase();
  
  // Set default values
  notification.sendAt = notification.sendAt || Date.now();
  notification.status = notification.status || 'pending';
  
  await db.collection<Notification>(COLLECTIONS.NOTIFICATIONS).insertOne(notification);
  return notification;
}

export async function updateNotificationStatus(
  notificationId: string,
  status: 'pending' | 'sent' | 'failed',
  metadata?: Record<string, any>
): Promise<Notification | null> {
  const db = await getDatabase();
  
  const updates: Record<string, any> = { status };
  
  if (status === 'sent') {
    updates.sentAt = Date.now();
  }
  
  if (metadata) {
    updates.metadata = metadata;
  }
  
  const result = await db.collection<Notification>(COLLECTIONS.NOTIFICATIONS).findOneAndUpdate(
    { _id: new ObjectId(notificationId) },
    { $set: updates },
    { returnDocument: 'after' }
  );
  
  return result || null;
}

export async function getPendingNotifications(): Promise<Notification[]> {
  const db = await getDatabase();
  return db.collection<Notification>(COLLECTIONS.NOTIFICATIONS)
    .find({ status: 'pending' })
    .toArray();
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  const db = await getDatabase();
  return db.collection<Notification>(COLLECTIONS.NOTIFICATIONS)
    .find({ userId })
    .sort({ sendAt: -1 })
    .toArray();
}