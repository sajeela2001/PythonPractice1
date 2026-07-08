// Firebase Database Service - Browser Compat Version

const firebaseConfig = {
  apiKey: "AIzaSyANmhfRMDgXk1bLuLZsq8JGusgV-YME-gM",
  authDomain: "ecp-blockchain-voting.firebaseapp.com",
  projectId: "ecp-blockchain-voting",
  storageBucket: "ecp-blockchain-voting.firebasestorage.app",
  messagingSenderId: "743870072066",
  appId: "1:743870072066:web:cfe03e789583432b21ae1b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export class DatabaseService {
    
    // ==================== VOTERS ====================
    
    static async saveVoter(voterData) {
        try {
            await db.collection('voters').doc(voterData.cnic).set(voterData);
            console.log('✅ Voter saved:', voterData.cnic);
            return true;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }

    static async getVoter(cnic) {
        try {
            const doc = await db.collection('voters').doc(cnic).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            return null;
        }
    }

    static async getAllVoters() {
        try {
            const snapshot = await db.collection('voters').get();
            const voters = [];
            snapshot.forEach(doc => voters.push(doc.data()));
            return voters;
        } catch (error) {
            return [];
        }
    }

    // ==================== CANDIDATES ====================

    static async saveCandidate(candidateData) {
        try {
            await db.collection('candidates').doc(candidateData.id).set(candidateData);
            console.log('✅ Candidate saved:', candidateData.name);
            return true;
        } catch (error) {
            return false;
        }
    }

    static async getAllCandidates() {
        try {
            const snapshot = await db.collection('candidates').get();
            const candidates = [];
            snapshot.forEach(doc => candidates.push(doc.data()));
            return candidates;
        } catch (error) {
            return [];
        }
    }

    // ==================== VOTES ====================

    static async saveVote(voteData) {
        try {
            await db.collection('votes').doc(voteData.txId).set(voteData);
            console.log('✅ Vote saved:', voteData.txId);
            return true;
        } catch (error) {
            return false;
        }
    }

    static async getAllVotes() {
        try {
            const snapshot = await db.collection('votes').get();
            const votes = [];
            snapshot.forEach(doc => votes.push(doc.data()));
            return votes;
        } catch (error) {
            return [];
        }
    }

    // ==================== PHOTO STORAGE (Firestore) ====================

    static async saveVoterPhoto(cnic, photoData) {
        try {
            await db.collection('voters').doc(cnic).update({
                photoData: photoData,
                photoUploaded: true,
                photoTimestamp: new Date().toISOString()
            });
            console.log('✅ Photo saved to Firestore for:', cnic);
            return true;
        } catch (error) {
            console.error('❌ Photo error:', error.message);
            try {
                await db.collection('voters').doc(cnic).set({
                    photoData: photoData,
                    photoUploaded: true,
                    photoTimestamp: new Date().toISOString()
                }, { merge: true });
                console.log('✅ Photo saved with set method');
                return true;
            } catch (err2) {
                console.error('❌ Complete failure:', err2.message);
                return null;
            }
        }
    }

    static async getVoterPhoto(cnic) {
        try {
            const doc = await db.collection('voters').doc(cnic).get();
            if (doc.exists && doc.data().photoData) {
                return doc.data().photoData;
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}