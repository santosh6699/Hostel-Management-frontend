import { api } from './axiosInstance';

export interface Dashboard { totalStudents: number; totalRooms: number; totalCapacity: number; occupiedBeds: number; availableBeds: number; occupancyPercent: number; pendingAllocations: number; outstandingFees: number; unresolvedComplaints: number; feeCollection: { month: string; amount: number }[]; recentStudents: Student[]; recentComplaints: Complaint[] }
export interface Room { id: number; roomNumber: string; block: string; floor: number; roomType: string; capacity: number; occupiedBeds: number; availableBeds: number; status: string }
export interface Student { id: number; studentId: string; fullName: string; email: string; phone: string; department: string; academicYear: number; accountStatus: string }
export interface Allocation { id: number; studentId: number; studentName: string; roomId: number; roomLabel: string; status: string; requestedAt: string; decisionNote?: string }
export interface Fee { id: number; studentId: number; studentName: string; category: string; billingPeriod: string; totalAmount: number; amountPaid: number; outstandingAmount: number; dueDate: string; status: string }
export interface Payment { id: number; feeId: number; studentId: number; amount: number; method: string; referenceCode: string; paidAt: string }
export interface Complaint { id: number; studentId: number; studentName: string; category: string; subject: string; description: string; status: string; resolutionNotes?: string; submittedAt: string }

export const hostelApi = {
  dashboard: async () => (await api.get<Dashboard>('/dashboard')).data,
  rooms: async () => (await api.get<Room[]>('/rooms')).data,
  students: async (search?: string) => (await api.get<Student[]>('/students', { params: { search } })).data,
  myStudent: async () => (await api.get<Student>('/students/me')).data,
  allocations: async () => (await api.get<Allocation[]>('/allocations')).data,
  fees: async () => (await api.get<Fee[]>('/fees')).data,
  payments: async () => (await api.get<Payment[]>('/payments')).data,
  complaints: async () => (await api.get<Complaint[]>('/complaints')).data,
  createRoom: async (body: Omit<Room, 'id'|'occupiedBeds'|'availableBeds'|'status'>) => (await api.post<Room>('/rooms', body)).data,
  updateRoom: async (id: number, body: Omit<Room, 'id'|'occupiedBeds'|'availableBeds'|'status'>) => (await api.put<Room>(`/rooms/${id}`, body)).data,
  deleteRoom: async (id: number) => api.delete(`/rooms/${id}`),
  createStudent: async (body: Omit<Student, 'id'|'accountStatus'>) => (await api.post<Student>('/students', body)).data,
  updateStudent: async (id: number, body: Omit<Student, 'id'|'accountStatus'>) => (await api.put<Student>(`/students/${id}`, body)).data,
  createFee: async (body: { studentId: number; category: string; billingPeriod: string; totalAmount: number; dueDate: string }) => (await api.post<Fee>('/fees', body)).data,
  createUser: async (body: { email: string; fullName: string; password: string; role: string }) => (await api.post('/users', body)).data,
  updateUser: async (id: number, body: { fullName: string; role: string; enabled: boolean }) => (await api.put(`/users/${id}`, body)).data,
  requestAllocation: async (studentId: number, roomId: number) => (await api.post('/allocations', { studentId, roomId })).data,
  decideAllocation: async (id: number, approve: boolean) => (await api.put(`/allocations/${id}/${approve ? 'approve' : 'reject'}`, {})).data,
  updateComplaint: async (id: number, status: string, resolutionNotes: string) => (await api.put(`/complaints/${id}/status`, { status, resolutionNotes })).data,
  createComplaint: async (category: string, subject: string, description: string) => (await api.post('/complaints', { category, subject, description })).data,
  recordPayment: async (feeId: number, amount: number, method: string) => (await api.post('/payments', { feeId, amount, method })).data,
};
