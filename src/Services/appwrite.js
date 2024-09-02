import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_URL) // Your Appwrite Endpoint
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Your project ID

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Environment variables
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const NOTES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// Auth functions
/**
 * Initiate Email OTP authentication
 * @param {string} email - User's email
 * @param {boolean} enableSecurityPhrase - Whether to enable security phrase
 * @returns {Promise<object>} - Session token object
 */
export const initiateEmailOTP = async (email, enableSecurityPhrase = true) => {
    try {
        return await account.createEmailToken(ID.unique(), email, enableSecurityPhrase);
    } catch (error) {
        console.error('Detailed error:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
};

/**
 * Create a session using Email OTP
 * @param {string} userId - User ID returned from initiateEmailOTP
 * @param {string} secret - OTP secret entered by the user
 * @returns {Promise<object>} - Created session object
 */
export const createSessionWithEmailOTP = async (userId, secret) => {
    try {
        return await account.createSession(userId, secret);
    } catch (error) {
        throw error;
    }
};

/**
 * Initiate Phone authentication
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<object>} - Session token object
 */
export const initiatePhoneAuth = async (phoneNumber) => {
    try {
        return await account.createPhoneToken(ID.unique(), phoneNumber);
    } catch (error) {
        console.error('Detailed error:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
};

/**
 * Create a session using Phone authentication
 * @param {string} userId - User ID returned from initiatePhoneAuth
 * @param {string} secret - OTP secret entered by the user
 * @returns {Promise<object>} - Created session object
 */
export const createSessionWithPhoneAuth = async (userId, secret) => {
    try {
        return await account.createSession(userId, secret);
    } catch (error) {
        throw error;
    }
};

/**
 * Logout the current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
    try {
        await account.deleteSession('current');
    } catch (error) {
        throw error;
    }
};

/**
 * Get the current authenticated user
 * @returns {Promise<object|null>} - User object or null if not authenticated
 */
export const getCurrentUser = async () => {
    try {
        const accountInfo = await account.get();
        try {
            const userDocument = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, accountInfo.$id);
            return { ...accountInfo, ...userDocument };
        } catch (dbError) {
            if (dbError.code === 404) {
                return accountInfo;
            }
            throw dbError;
        }
    } catch (error) {
        return null;
    }
};

/**
 * Delete the current session
 * @returns {Promise<void>}
 */
export const deleteCurrentSession = async () => {
    try {
        await account.deleteSession('current');
    } catch (error) {
        throw error;
    }
};

// Database functions

/**
 * Create a new document in a collection
 * @param {string} collectionId - Collection ID
 * @param {object} data - Document data
 * @param {Array} permissions - Document permissions
 * @returns {Promise<object>} - Created document object
 */
export const createDocument = async (collectionId, data, permissions = []) => {
    try {
        await ensureAuthenticated();
        return await databases.createDocument(DATABASE_ID, collectionId, ID.unique(), data, permissions);
    } catch (error) {
        throw error;
    }
};

/**
 * List documents in a collection
 * @param {string} collectionId - Collection ID
 * @param {Array} queries - Query parameters
 * @returns {Promise<Array>} - List of documents
 */
export const listDocuments = async (collectionId, queries = []) => {
    try {
        await ensureAuthenticated();
        return await databases.listDocuments(DATABASE_ID, collectionId, queries);
    } catch (error) {
        throw error;
    }
};

/**
 * Get a document by ID
 * @param {string} collectionId - Collection ID
 * @param {string} documentId - Document ID
 * @returns {Promise<object>} - Document object
 */
export const getDocument = async (collectionId, documentId) => {
    try {
        await ensureAuthenticated();
        return await databases.getDocument(DATABASE_ID, collectionId, documentId);
    } catch (error) {
        throw error;
    }
};

/**
 * Toggle the favorite status of a note
 * @param {string} noteId - The ID of the note to toggle
 * @returns {Promise<object>} - Updated note object
 */
export const toggleNoteFavorite = async (noteId) => {
  try {
    await ensureAuthenticated();
    const note = await databases.getDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
    const updatedNote = await databases.updateDocument(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      noteId,
      { isFavorite: !note.isFavorite }
    );
    return updatedNote;
  } catch (error) {
    console.error('Error toggling note favorite:', error);
    throw error;
  }
};

/**
 * Update a document by ID
 * @param {string} collectionId - Collection ID
 * @param {string} documentId - Document ID
 * @param {object} data - Updated document data
 * @returns {Promise<object>} - Updated document object
 */
export const updateDocument = async (collectionId, documentId, data) => {
    try {
        await ensureAuthenticated();
        return await databases.updateDocument(DATABASE_ID, collectionId, documentId, data);
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a document by ID
 * @param {string} collectionId - Collection ID
 * @param {string} documentId - Document ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionId, documentId) => {
    try {
        await ensureAuthenticated();
        await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
    } catch (error) {
        throw error;
    }
};

// Profile management functions

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} data - Profile data
 * @returns {Promise<object>} - Updated or created profile document
 */
export const updateUserProfile = async (userId, data) => {
    try {
        await ensureAuthenticated();
        const updateData = {
            name: data.name,
            username: data.username,
            profileImageId: data.profileImageId || ''
        };
        try {
            return await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, updateData);
        } catch (updateError) {
            if (updateError.code === 404) {
                return await databases.createDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, updateData);
            } else {
                throw updateError;
            }
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Get profile image URL by file ID
 * @param {string} fileId - File ID
 * @returns {Promise<string>} - Profile image URL
 */
export const getProfileImage = async (fileId) => {
    try {
        const result = await storage.getFileView(BUCKET_ID, fileId);
        return result.href;
    } catch (error) {
        if (error.code === 404) {
            return '/path/to/placeholder-image.jpg'; // Replace with your placeholder image path
        }
        throw error;
    }
};

/**
 * Upload a profile image
 * @param {File} file - Profile image file
 * @returns {Promise<object>} - Uploaded file object
 */
export const uploadProfileImage = async (file) => {
    try {
        await ensureAuthenticated();
        return await storage.createFile(BUCKET_ID, ID.unique(), file);
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a profile image by file ID
 * @param {string} fileId - File ID
 * @returns {Promise<void>}
 */
export const deleteProfileImage = async (fileId) => {
    try {
        await ensureAuthenticated();
        try {
            await storage.getFile(BUCKET_ID, fileId);
        } catch (error) {
            if (error.code === 404) {
                return;
            }
            throw error;
        }
        await storage.deleteFile(BUCKET_ID, fileId);
    } catch (error) {
        throw error;
    }
};

/**
 * Delete the current user's account
 * @returns {Promise<void>}
 */
export const deleteUserAccount = async () => {
    try {
        await ensureAuthenticated();
        const user = await getCurrentUser();

        // Delete user's profile image if it exists
        if (user.profileImageId) {
            await deleteProfileImage(user.profileImageId);
        }

        // Try to delete all user's notes
        try {
            const userNotes = await databases.listDocuments(DATABASE_ID, NOTES_COLLECTION_ID, [
                Query.equal('userId', user.$id)
            ]);
            for (const note of userNotes.documents) {
                await databases.deleteDocument(DATABASE_ID, NOTES_COLLECTION_ID, note.$id);
            }
        } catch (noteError) {
            console.error('Error deleting user notes:', noteError);
            // Continue with account deletion even if note deletion fails
        }

        // Delete user's profile document from the database
        await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id);

        // Delete user's account
        await account.deleteSession('current');
        await account.delete();

        return true; // Indicate successful deletion
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
};

// Helper function

/**
 * Ensure the user is authenticated
 * @returns {Promise<void>}
 * @throws {Error} - If the user is not authenticated
 */
const ensureAuthenticated = async () => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User is not authenticated');
    }
};