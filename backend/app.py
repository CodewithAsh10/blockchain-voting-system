from flask import Flask, request, jsonify
from flask_cors import CORS
from blockchain.blockchain import Blockchain
from blockchain.vote import Vote
import time
import hashlib

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

blockchain = Blockchain()
registered_voters = {}
admin_key = "admin123"

@app.route('/chain', methods=['GET'])
def get_chain():
    chain_data = []
    for block in blockchain.chain:
        # Convert transactions to dictionaries
        transactions_dict = []
        for tx in block.transactions:
            if hasattr(tx, 'to_dict'):
                transactions_dict.append(tx.to_dict())
            else:
                transactions_dict.append(tx)
        
        block_dict = {
            "index": block.index,
            "transactions": transactions_dict,
            "timestamp": block.timestamp,
            "previous_hash": block.previous_hash,
            "hash": block.hash,
            "nonce": block.nonce
        }
        chain_data.append(block_dict)
    
    return jsonify({
        "chain": chain_data,
        "length": len(chain_data)
    }), 200

@app.route('/vote', methods=['POST'])
def add_vote():
    try:
        data = request.get_json()
        print("Received vote data:", data)  # Debug print
        
        if not data:
            return jsonify({"message": "No data provided"}), 400
            
        required_fields = ['voter_id', 'candidate']
        
        if not all(field in data for field in required_fields):
            return jsonify({"message": "Missing fields"}), 400
        
        # Verify voter is registered
        voter_id_hash = hashlib.sha256(data['voter_id'].encode()).hexdigest()
        if voter_id_hash not in registered_voters:
            return jsonify({"message": "Voter not registered"}), 400
        
        # Check if voter has already voted
        for block in blockchain.chain:
            for transaction in block.transactions:
                if hasattr(transaction, 'voter_id') and transaction.voter_id == voter_id_hash:
                    return jsonify({"message": "Already voted"}), 400
        
        # Create and add vote
        vote = Vote(voter_id_hash, data['candidate'], time.time())
        success = blockchain.add_vote(vote)
        
        if success:
            # Mine the block if we have pending transactions
            if len(blockchain.pending_transactions) >= 1:  # Reduced from 3 to 1 for testing
                blockchain.mine_pending_transactions()
            return jsonify({"message": "Vote added successfully"}), 201
        else:
            return jsonify({"message": "Failed to add vote"}), 500
            
    except Exception as e:
        print("Error in add_vote:", str(e))
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route('/results', methods=['GET'])
def get_results():
    try:
        results = blockchain.get_votes_by_candidate()
        return jsonify(results), 200
    except Exception as e:
        print("Error in get_results:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/register', methods=['POST'])
def register_voter():
    try:
        data = request.get_json()
        print("Registration data:", data)  # Debug print
        
        if not data or 'voter_id' not in data:
            return jsonify({"message": "Voter ID required"}), 400
        
        if 'admin_key' not in data or data['admin_key'] != admin_key:
            return jsonify({"message": "Invalid admin key"}), 401
        
        voter_id_hash = hashlib.sha256(data['voter_id'].encode()).hexdigest()
        
        if voter_id_hash in registered_voters:
            return jsonify({"message": "Voter already registered"}), 400
        
        registered_voters[voter_id_hash] = True
        print(f"Registered voter: {data['voter_id']} -> {voter_id_hash}")
        return jsonify({"message": "Voter registered successfully"}), 201
        
    except Exception as e:
        print("Error in register_voter:", str(e))
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route('/validate', methods=['GET'])
def validate_chain():
    is_valid = blockchain.is_chain_valid()
    return jsonify({"valid": is_valid}), 200

@app.route('/registered', methods=['GET'])
def get_registered_voters():
    # For debugging - returns count of registered voters
    return jsonify({"count": len(registered_voters)}), 200

if __name__ == '__main__':
    print("Starting Flask server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
