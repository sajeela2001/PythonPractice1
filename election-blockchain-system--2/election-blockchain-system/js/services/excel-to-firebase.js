// Excel to Firebase Import Service

export class ExcelToFirebase {
    
    static async uploadExcelToFirebase() {
        const db = firebase.firestore();
        
        try {
            // ============ READ VOTERS ============
            const votersResponse = await fetch('data/voters.csv');
            const votersText = await votersResponse.text();
            const votersData = ExcelToFirebase.csvToJson(votersText);
            
            console.log(`📊 Found ${votersData.length} voters`);
            
            for (const voter of votersData) {
                const cnic = voter['CNIC'] || voter['cnic'] || '';
                if (cnic) {
                    await db.collection('voters').doc(String(cnic)).set({
                        cnic: String(cnic),
                        name: voter['Name'] || voter['name'] || '',
                        fatherName: voter['Father Name'] || voter['fatherName'] || '',
                        age: parseInt(voter['Age'] || voter['age']) || 0,
                        gender: (voter['Gender'] || voter['gender'] || '').toLowerCase(),
                        phone: String(voter['Phone'] || voter['phone'] || ''),
                        email: voter['Email'] || voter['email'] || '',
                        address: voter['Address'] || voter['address'] || '',
                        constituency: voter['Constituency'] || voter['constituency'] || '',
                        province: voter['Province'] || voter['province'] || '',
                        voterId: voter['Voter ID'] || voter['voterId'] || '',
                        isRegistered: true,
                        hasVoted: voter['Has Voted'] === 'Yes' || voter['hasVoted'] === 'true',
                        source: 'excel_import'
                    });
                    console.log('✅ Saved voter:', cnic);
                }
            }
            
            // ============ READ CANDIDATES ============
            const candidatesResponse = await fetch('data/candidates.csv');
            const candidatesText = await candidatesResponse.text();
            const candidatesData = ExcelToFirebase.csvToJson(candidatesText);
            
            console.log(`📊 Found ${candidatesData.length} candidates`);
            
            for (const candidate of candidatesData) {
                const id = candidate['ID'] || candidate['id'] || '';
                if (id) {
                    await db.collection('candidates').doc(String(id)).set({
                        id: String(id),
                        name: candidate['Name'] || candidate['name'] || '',
                        party: candidate['Party'] || candidate['party'] || '',
                        symbol: candidate['Symbol'] || candidate['symbol'] || '',
                        electionType: (candidate['Election Type'] || candidate['electionType'] || 'national').toLowerCase(),
                        status: (candidate['Status'] || candidate['status'] || 'active').toLowerCase(),
                        votes: parseInt(candidate['Votes'] || candidate['votes']) || 0,
                        source: 'excel_import'
                    });
                    console.log('✅ Saved candidate:', id);
                }
            }
            
            // ============ READ VOTES ============
            const votesResponse = await fetch('data/votes.csv');
            const votesText = await votesResponse.text();
            const votesData = ExcelToFirebase.csvToJson(votesText);
            
            console.log(`📊 Found ${votesData.length} votes`);
            
            for (const vote of votesData) {
                const txId = vote['TX ID'] || vote['txId'] || '';
                if (txId) {
                    await db.collection('votes').doc(String(txId)).set({
                        txId: String(txId),
                        voterCNIC: vote['Voter CNIC'] || vote['voterCNIC'] || '',
                        candidateName: vote['Candidate Name'] || vote['candidateName'] || '',
                        candidateParty: vote['Candidate Party'] || vote['candidateParty'] || '',
                        electionType: (vote['Election Type'] || vote['electionType'] || '').toLowerCase(),
                        faceVerified: vote['Face Verified'] === 'Yes' || vote['faceVerified'] === 'true',
                        timestamp: vote['Timestamp'] || vote['timestamp'] || new Date().toISOString(),
                        source: 'excel_import'
                    });
                    console.log('✅ Saved vote:', txId);
                }
            }
            
            console.log('🎉 ALL EXCEL DATA UPLOADED TO FIREBASE!');
            return { success: true, message: 'All data uploaded!' };
            
        } catch (error) {
            console.error('❌ Error:', error.message);
            return { success: false, message: error.message };
        }
    }
    
    static csvToJson(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            result.push(obj);
        }
        return result;
    }
}