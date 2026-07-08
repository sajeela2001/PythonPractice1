// Real Blockchain Implementation with SHA-256 & Proof of Work

export class Blockchain {
    constructor() {
        this.chain = [];
        this.difficulty = 2; // Number of leading zeros required
        this.pendingTransactions = [];
    }

    async sha256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async initializeGenesisBlock() {
        if (this.chain.length === 0) {
            const genesisBlock = {
                blockNumber: 0,
                timestamp: new Date().toISOString(),
                type: 'GENESIS',
                data: {
                    candidateName: 'GENESIS',
                    voterCNIC: 'N/A',
                    message: 'ECP Blockchain Voting System - Genesis Block'
                },
                previousHash: '0'.repeat(64),
                hash: '',
                nonce: 0
            };
            
            genesisBlock.hash = await this.calculateBlockHash(genesisBlock);
            this.chain.push(genesisBlock);
            console.log('✅ Genesis block created with hash:', genesisBlock.hash.substring(0, 20) + '...');
        }
    }

    async calculateBlockHash(block) {
        const blockData = {
            blockNumber: block.blockNumber,
            timestamp: block.timestamp,
            data: block.data,
            previousHash: block.previousHash,
            nonce: block.nonce
        };
        return await this.sha256(JSON.stringify(blockData));
    }

    async mineBlock(blockData) {
        const previousBlock = this.getLatestBlock();
        const blockNumber = this.chain.length;
        const timestamp = new Date().toISOString();
        let nonce = 0;
        let hash = '';
        
        const target = '0'.repeat(this.difficulty);
        
        console.log(`⛏️ Mining block #${blockNumber}... (difficulty: ${this.difficulty})`);
        const startTime = Date.now();
        
        while (true) {
            hash = await this.calculateBlockHash({
                blockNumber,
                timestamp,
                data: blockData,
                previousHash: previousBlock.hash,
                nonce
            });
            
            if (hash.substring(0, this.difficulty) === target) {
                break;
            }
            nonce++;
            
            // Log progress every 10000 attempts
            if (nonce % 10000 === 0) {
                console.log(`   Still mining... nonce: ${nonce}`);
            }
        }
        
        const miningTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Block #${blockNumber} mined in ${miningTime}s! Nonce: ${nonce}`);
        console.log(`   Hash: ${hash.substring(0, 30)}...`);
        
        const newBlock = {
            blockNumber,
            timestamp,
            type: 'VOTE',
            data: blockData,
            previousHash: previousBlock.hash,
            hash,
            nonce
        };
        
        return newBlock;
    }

    async addBlock(voteData) {
        // Check for duplicate votes
        const hasVoted = this.chain.some(block => 
            block.type === 'VOTE' && 
            block.data && 
            block.data.voterCNIC === voteData.voterCNIC
        );

        if (hasVoted) {
            throw new Error('This CNIC has already voted on the blockchain');
        }

        const block = await this.mineBlock(voteData);
        this.chain.push(block);
        return block;
    }

    async addPreFilledBlock(blockData) {
        // For pre-filled blocks, use faster mining with difficulty 1
        const previousBlock = this.getLatestBlock();
        const blockNumber = this.chain.length;
        const timestamp = new Date().toISOString();
        let nonce = 0;
        let hash = '';
        
        const target = '0'; // Only 1 leading zero for pre-filled blocks
        
        while (true) {
            hash = await this.calculateBlockHash({
                blockNumber,
                timestamp,
                data: blockData,
                previousHash: previousBlock.hash,
                nonce
            });
            
            if (hash.substring(0, 1) === target) {
                break;
            }
            nonce++;
        }
        
        const newBlock = {
            blockNumber,
            timestamp,
            type: 'VOTE',
            data: blockData,
            previousHash: previousBlock.hash,
            hash,
            nonce
        };
        
        this.chain.push(newBlock);
        return newBlock;
    }

    async validateChain() {
        console.log('🔍 Validating blockchain...');
        
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Verify current block hash
            const recalculatedHash = await this.calculateBlockHash(currentBlock);
            if (currentBlock.hash !== recalculatedHash) {
                console.error(`❌ Block #${i} hash is invalid!`);
                console.error(`   Stored: ${currentBlock.hash.substring(0, 20)}...`);
                console.error(`   Calculated: ${recalculatedHash.substring(0, 20)}...`);
                return false;
            }

            // Verify chain linkage
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.error(`❌ Block #${i} previous hash doesn't match!`);
                return false;
            }
            
            console.log(`✅ Block #${i} validated`);
        }
        
        console.log('✅ Blockchain is VALID!');
        return true;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    getLatestBlocks(count = 12) {
        return this.chain.slice(-count);
    }

    findTransaction(txId) {
        if (!txId) return null;
        
        for (const block of this.chain) {
            if (block.data && block.data.txId === txId) {
                return {
                    block: block,
                    data: block.data,
                    timestamp: block.timestamp,
                    verified: true
                };
            }
        }
        return null;
    }

    getTotalVotes() {
        return this.chain.filter(block => block.type === 'VOTE').length;
    }

    getChain() {
        return this.chain;
    }

    restoreChain(data) {
        if (data && Array.isArray(data) && data.length > 0) {
            this.chain = data;
            console.log('📦 Chain restored from storage with', this.chain.length, 'blocks');
            // Validate on restore
            this.validateChain().then(isValid => {
                if (!isValid) {
                    console.error('⚠️ Restored chain is INVALID!');
                }
            });
        } else {
            console.log('No chain data found, initializing genesis block');
        }
    }

    getChainForDisplay() {
        return this.chain.slice().reverse();
    }

    getBlockchainStats() {
        const totalBlocks = this.chain.length;
        const totalVotes = this.getTotalVotes();
        const genesisBlock = this.chain[0];
        const latestBlock = this.getLatestBlock();
        
        const uniqueVoters = new Set();
        this.chain.forEach(block => {
            if (block.data && block.data.voterCNIC) {
                uniqueVoters.add(block.data.voterCNIC);
            }
        });

        return {
            totalBlocks,
            totalVotes,
            uniqueVoters: uniqueVoters.size,
            genesisTime: genesisBlock.timestamp,
            latestBlockTime: latestBlock.timestamp,
            difficulty: this.difficulty
        };
    }
}