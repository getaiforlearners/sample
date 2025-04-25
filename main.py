import os
import json
from app import app  # noqa: F401

def get_farewell_person_info():
    """Get information about the person who is leaving."""
    farewell_config_path = 'memories/farewell_config.json'
    
    # Check if config already exists
    if os.path.exists(farewell_config_path):
        with open(farewell_config_path, 'r') as f:
            return json.load(f)
            
    # Get information from user
    print("\n===== Welcome to the Farewell Celebration App! =====")
    print("Please provide information about the person leaving:")
    
    farewell_person = input("Enter the name of the person leaving: ")
    farewell_message = input("Enter a special farewell message (optional): ") or f"We'll miss you, {farewell_person}!"
    
    # Store the information
    config = {
        "farewell_person": farewell_person,
        "farewell_message": farewell_message
    }
    
    # Save to config file
    with open(farewell_config_path, 'w') as f:
        json.dump(config, f)
    
    print(f"\nThank you! The farewell page has been set up for {farewell_person}.")
    return config

if __name__ == '__main__':
    # Get farewell person information
    farewell_info = get_farewell_person_info()
    
    # Save to app config
    app.config['FAREWELL_PERSON'] = farewell_info['farewell_person']
    app.config['FAREWELL_MESSAGE'] = farewell_info['farewell_message']
    
    # Run the app
    print("\nStarting the Farewell Celebration App...")
    app.run(host='0.0.0.0', port=5000, debug=True)
