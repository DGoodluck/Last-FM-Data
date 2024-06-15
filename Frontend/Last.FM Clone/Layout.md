pages:
Home
Statistics

Home:
Header
{Username} • scrobbling since {Date} • Number of Scrobbles
upload csv
List recent songs

Statistics:
Sorting
Top Artists
Top Songs
Top Albums
Listening Patterns (Heatmaps, Clock)
Footer

Sorting Time Period:
1 Day 
1 week
1 Month
6 Months
1 Year
All Time

To adapt the previous explanation for a Flask backend, you'll need to create a Flask route that handles file uploads. This route will receive the file from your frontend, save it to a directory on the server, and then provide a way to access this file from your Jupyter Notebook.

### Step 1: Setting Up Flask for File Uploads

First, ensure you have Flask installed in your project. If not, you can install it using pip:

```bash
pip install Flask
```

Then, create a simple Flask application with a route to handle file uploads. You'll use Flask's `request` object to access the uploaded file and `os` module to interact with the filesystem.

**Flask App Example:**

```python
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if file:
        # Define the folder where you want to save the file
        UPLOAD_FOLDER = './uploads'
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        
        # Save the file to the specified folder
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        # Return a success message along with the file path
        return jsonify({'message': 'CSV file uploaded successfully.', 'file_path': file_path}), 200

if __name__ == '__main__':
    app.run(debug=True)
```

### Step 2: Modify Your Frontend to Send the File to the Flask Server

Your frontend needs to send the uploaded file to the Flask server. This involves modifying your file upload handler to send the file data to the `/upload-csv` endpoint.

**React Example:**

```jsx
const handleFormSubmit = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await fetch('/upload-csv', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        console.log(result); // Handle success
    } catch (error) {
        console.error(error); // Handle error
    }
};
```

### Step 3: Access the Uploaded File in Jupyter Notebook

After the file is uploaded to the server, you can access it from your Jupyter Notebook by reading it from the location where it was saved. Use the file path returned by the Flask server to read the file.

**Python in Jupyter Notebook:**

```python
import pandas as pd

# Assuming you have the file path stored in a variable named filePath
filePath = '/path/to/your/uploaded/file.csv'

# Read the CSV file
df = pd.read_csv(filePath)

# Now you can work with df in your Jupyter Notebook
print(df.head())
```

This setup allows your Flask application to act as an intermediary between your frontend and Jupyter Notebook, facilitating the transfer of uploaded files. Ensure that both your Flask server and Jupyter Notebook are configured to access the same network resources, especially if they're running on different machines.
