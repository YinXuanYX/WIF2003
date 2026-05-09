// Mock User Database
// Replicates the Mongoose document shape.

export const mockUsers = [
  {
    _id: '6651a1f2e4b0c123456789ab',
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'mock_hashed_password_123', // plain-text for mock only
    isActive: true,
    riskProfile: {
      profile: null,
      allocation: { bonds: 0, equities: 0, cash: 0 },
      score: 0,
    },
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-05-01T12:00:00.000Z',
  },
  {
    _id: '6651a1f2e4b0c123456789ac',
    name: 'Deactivated User',
    email: 'deactivated@example.com',
    passwordHash: 'mock_hashed_password_456',
    isActive: false, // tests the isActive guard in ProtectedRoute
    riskProfile: {
      profile: null,
      allocation: { bonds: 0, equities: 0, cash: 0 },
      score: 0,
    },
    createdAt: '2026-02-10T08:00:00.000Z',
    updatedAt: '2026-04-20T12:00:00.000Z',
  },
];
