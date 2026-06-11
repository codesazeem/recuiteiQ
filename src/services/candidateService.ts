import * as candidateRepo from '@/src/repositories/candidateRepository';

export async function listCandidates() {
  return candidateRepo.getCandidates();
}

export async function fetchCandidate(id: string) {
  return candidateRepo.getCandidateById(id);
}

export async function addCandidate(data: Omit<candidateRepo.CandidateRecord, '_id' | 'createdAt' | 'updatedAt'>) {
  return candidateRepo.createCandidate(data);
}

export async function changeCandidate(id: string, updates: Partial<candidateRepo.CandidateRecord>) {
  return candidateRepo.updateCandidate(id, updates);
}
