// Mock Firebase Auth
export const mockFirebaseAuth = {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    onIdTokenChanged: jest.fn(),
}

// Mock Firebase User
export const createMockFirebaseUser = (overrides = {}) => ({
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    getIdToken: jest.fn().mockResolvedValue('mock-token'),
    ...overrides,
})

// Mock the entire firebase/auth module
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => mockFirebaseAuth),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    onIdTokenChanged: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    signInWithPopup: jest.fn(),
}))

// Mock the firebase config
jest.mock('@/lib/firebase', () => ({
    auth: mockFirebaseAuth,
    app: {},
}))

// Placeholder test to satisfy Jest
test('firebase mock placeholder', () => {
    expect(true).toBe(true);
});
