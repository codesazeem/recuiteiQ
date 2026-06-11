import clientPromise from '@/src/lib/mongodb';
import { ObjectId } from 'mongodb';

export type CandidateRecord = {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  currentRole?: string;
  yearsOfExperience?: number;
  educationSummary?: string;
  status: 'lead' | 'screening' | 'interview' | 'offer' | 'hired' | 'archive';
  source?: string;
  tags: string[];
  resumeText?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
};

const collectionName = 'candidates';

export async function getCandidates() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<CandidateRecord>(collectionName).find().sort({ updatedAt: -1 }).toArray();
}

export async function getCandidateById(id: string) {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<CandidateRecord>(collectionName).findOne({ _id: new ObjectId(id) });
}

export async function createCandidate(data: Omit<CandidateRecord, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise;
  const db = client.db();
  const now = new Date();
  const result = await db.collection<CandidateRecord>(collectionName).insertOne({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return getCandidateById(result.insertedId.toString());
}

export async function updateCandidate(id: string, updates: Partial<CandidateRecord>) {
  const client = await clientPromise;
  const db = client.db();
  await db.collection<CandidateRecord>(collectionName).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return getCandidateById(id);
}
