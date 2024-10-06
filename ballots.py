from flask import Flask, request, jsonify
import requests
import urllib.parse

app = Flask(__name__)

# Dictionary with state competitiveness data
state_competition = {
    'AL': 15, 'AK': 8, 'AZ': 2, 'AR': 16, 'CA': -13, 'CO': -4, 'CT': -7, 'DE': -7, 'FL': 3, 'GA': 3,
    'HI': -14, 'ID': 18, 'IL': -7, 'IN': 11, 'IA': 6, 'KS': 10, 'KY': 16, 'LA': 12, 'ME': -2, 'MD': -14,
    'MA': -15, 'MI': 1, 'MN': -1, 'MS': 11, 'MO': 10, 'MT': 11, 'NE': 13, 'NV': 1, 'NH': -1, 'NJ': -6,
    'NM': -3, 'NY': -10, 'NC': 3, 'ND': 20, 'OH': 6, 'OK': 20, 'OR': -6, 'PA': 2, 'RI': -8, 'SC': 8,
    'SD': 16, 'TN': 14, 'TX': 5, 'UT': 13, 'VT': -16, 'VA': -3, 'WA': -8, 'WV': 22, 'WI': 2, 'WY': 25, 'DC': -43
}

# Function to determine competitiveness
def get_competitive_status(value):
    if value >= 15:
        return "Safe Republican"
    elif 5 <= value < 15:
        return "Likely Republican"
    elif 3 <= value < 5:
        return "Lean Republican"
    elif -3 <= value < 3:
        return "Tossup"
    elif -5 <= value < -3:
        return "Lean Democratic"
    elif -15 <= value < -5:
        return "Likely Democratic"
    else:
        return "Safe Democratic"

# Function to call Google Civics API
def get_election_data(address):
    api_key = 'AIzaSyC3kCg6Q5fexk3Ol73GlmNLejRa_D4T35w'  # Replace with your API key
    # Get elections
    elections_url = f'https://www.googleapis.com/civicinfo/v2/elections?key={api_key}'
    elections_response = requests.get(elections_url)

    if elections_response.status_code != 200:
        print(f"Error fetching elections: {elections_response.status_code}, {elections_response.text}")
        return None

    elections_data = elections_response.json()
    # Filter out test elections and find live elections
    live_elections = [election for election in elections_data['elections'] if "test" not in election['name'].lower()]

    if not live_elections:
        return None

    # Use the first live election (you can modify to choose specific elections as needed)
    election_id = live_elections[0]['id']

    voter_info_url = f'https://www.googleapis.com/civicinfo/v2/voterinfo?address={urllib.parse.quote(address)}&electionId={election_id}&key={api_key}'
    voter_info_response = requests.get(voter_info_url)

    if voter_info_response.status_code == 200:
        return voter_info_response.json()
    else:
        print(f"Error fetching voter info: {voter_info_response.status_code}, {voter_info_response.text}")
        return None

# Function to get contests
def get_contests(election_id):
    api_key = 'AIzaSyC3kCg6Q5fexk3Ol73GlmNLejRa_D4T35w'  # Replace with your API key
    contests_url = f'https://www.googleapis.com/civicinfo/v2/elections/{election_id}/contests?key={api_key}'
    contests_response = requests.get(contests_url)

    if contests_response.status_code == 200:
        return contests_response.json()
    else:
        print(f"Error fetching contests: {contests_response.status_code}, {contests_response.text}")
        return None

@app.route('/state_competition', methods=['POST'])
def state_competition_endpoint():
    # Get the state and address from the JSON payload
    data = request.get_json()
    state = data.get('state', '').upper()
    address = data.get('address', '')

    if not address:
        return jsonify({'error': 'Address is required'}), 400

    # Get election data from Google Civics API
    election_data = get_election_data(address)
    if not election_data:
        return jsonify({'error': 'Unable to fetch election data'}), 500

    # Get the election ID from the response
    election_id = election_data.get('election', {}).get('id')

    # Get contests for the specific election
    contests_data = get_contests(election_id) if election_id else None

    if state in state_competition:
        value = state_competition[state]
        status = get_competitive_status(value)
        return jsonify({
            'state': state,
            'competitiveness_value': value,
            'competitiveness_status': status,
            'election_data': election_data,
            'contests': contests_data.get('contests', []) if contests_data else []
        })
    else:
        return jsonify({'error': 'State not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)