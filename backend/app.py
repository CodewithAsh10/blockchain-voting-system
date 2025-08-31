from flask import Flask, request, jsonify
from flask_cors import CORS
from blockchain.blockchain import Blockchain
from blockchain.vote import Vote
import time
import hashlib

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

blockchain = Blockchain()
registered_voters = {}  # Stores voter information with hashed IDs as keys
admin_key = "admin123"  # In production, use secure authentication

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
        
        # Verify voter is registered and active
        voter_id_hash = hashlib.sha256(data['voter_id'].encode()).hexdigest()
        if voter_id_hash not in registered_voters:
            return jsonify({"message": "Voter not registered"}), 400
        
        # Check if voter is approved
        if registered_voters[voter_id_hash]['status'] != 'Active':
            return jsonify({"message": "Voter not approved. Please contact administrator."}), 400
        
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
            if len(blockchain.pending_transactions) >= 1:
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

# Voter self-registration endpoint
@app.route('/register_voter', methods=['POST'])
def register_voter_self():
    try:
        data = request.get_json()
        print("Voter registration data:", data)
        
        if not data:
            return jsonify({"message": "No data provided"}), 400
        
        # Check for required fields
        required_fields = ['id', 'name', 'email', 'place', 'age']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400
        
        # Hash the voter ID for storage
        voter_id_hash = hashlib.sha256(data['id'].encode()).hexdigest()
        
        if voter_id_hash in registered_voters:
            return jsonify({"message": "Voter ID already registered"}), 400
        
        # Store voter information
        voter_info = {
            'original_id': data['id'],
            'name': data['name'],
            'email': data['email'],
            'place': data['place'],
            'age': data['age'],
            'status': 'Pending'  # Needs admin approval
        }
        
        registered_voters[voter_id_hash] = voter_info
        print(f"Voter registered: {data['id']} -> {voter_id_hash}")
        return jsonify({
            "message": "Registration submitted successfully. Waiting for admin approval.",
            "hashed_id": voter_id_hash
        }), 201
        
    except Exception as e:
        print("Error in register_voter_self:", str(e))
        return jsonify({"message": f"Server error: {str(e)}"}), 500

# Admin approval endpoint
@app.route('/approve_voter', methods=['POST'])
def approve_voter():
    try:
        data = request.get_json()
        
        if 'admin_key' not in data or data['admin_key'] != admin_key:
            return jsonify({"message": "Invalid admin key"}), 401
        
        if 'voter_hash' not in data:
            return jsonify({"message": "Voter hash required"}), 400
        
        voter_hash = data['voter_hash']
        if voter_hash not in registered_voters:
            return jsonify({"message": "Voter not found"}), 404
        
        # Approve the voter
        registered_voters[voter_hash]['status'] = 'Active'
        print(f"Approved voter: {voter_hash}")
        return jsonify({"message": "Voter approved successfully"}), 200
        
    except Exception as e:
        print("Error in approve_voter:", str(e))
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route('/voters', methods=['GET'])
def get_voters():
    try:
        # Return all registered voters with their status
        voters_list = []
        for voter_hash, voter_info in registered_voters.items():
            voters_list.append({
                'hashed_id': voter_hash,
                'original_id': voter_info['original_id'],
                'name': voter_info['name'],
                'email': voter_info['email'],
                'place': voter_info['place'],
                'age': voter_info['age'],
                'status': voter_info['status']
            })
        
        return jsonify(voters_list), 200
        
    except Exception as e:
        print("Error in get_voters:", str(e))
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
