import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from requests.exceptions import Timeout
from dotenv import load_dotenv, find_dotenv
from images_generator import get_image
from data_cleaner import data_cleaner

dotenv_path = find_dotenv(".env")
load_dotenv(dotenv_path)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
PORT = int(os.getenv("PORT", 5000))
DEBUG = os.getenv("DEBUG", "false").lower() in ["true", "1", "t"]
MAX_FILE_SIZE = 12 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

artist_img_cache = {}


def save_file(file: FileStorage, directory: str, allowed_extensions: set) -> str:
    """
    Saves an uploaded file to a specified directory if it has an allowed extension.

    Args:
        file (FileStorage): The file object to be saved.
        directory (str): The directory where the file should be saved.
        allowed_extensions (set): A set of allowed file extensions.

    Returns:
        str: The file path if the file is successfully saved, None otherwise.
    """
    if not allowed_file(file.filename, allowed_extensions):
        return None

    filename = secure_filename(file.filename)
    file_path = os.path.join(directory, filename)

    try:
        file.save(file_path)
        return file_path
    except Exception as e:
        logger.error("Error saving file: %s", e)
        return None


def allowed_file(filename: str, allowed_extensions: set) -> bool:
    """
    Checks if a file has an allowed extension.

    Args:
        filename (str): The name of the file to check.
        allowed_extensions (set): A set of allowed file extensions.

    Returns:
        bool: True if the file has an allowed extension, False otherwise.
    """
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions


@app.route("/get-img", methods=["POST"])
def get_img():
    """
    Handle POST requests to fetch an image URL based on provided target, artist, and target type.

    Returns:
        JSON response with the image URL if found.
    """
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No data provided."}), 400

    target = data.get("target")
    artist = data.get("artist")
    target_type = data.get("target_type")

    if not target or not target_type:
        return (
            jsonify({"status": "error", "message": "Missing required parameters."}),
            400,
        )

    cache_key = f"{target}-{target_type}"

    if cache_key in artist_img_cache:
        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Image found.",
                    "get_img": artist_img_cache[cache_key],
                }
            ),
            200,
        )

    try:
        artist_img_url = get_image(target, artist, target_type)
    except Timeout:
        return jsonify({"status": "error", "message": "Timeout error."}), 504
    except Exception as e:
        logger.error("Error saving image: %s", e)
        return jsonify({"status": "error", "message": "Error fetching image."}), 500

    if artist_img_url:
        artist_img_cache[cache_key] = artist_img_url
        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Image found.",
                    "get_img": artist_img_url,
                }
            ),
            200,
        )

    return jsonify({"status": "error", "message": "Image not found."}), 404


def check_for_json():
    """
    Check if a file named 'output.json' exists in the specified directory.

    Returns:
        bool: True if 'output.json' exists, False otherwise.
    """
    return os.path.exists(os.path.join(UPLOAD_FOLDER, "output.json"))


@app.route("/check-json", methods=["GET"])
def check_json():
    """
    Check for the existence of a JSON file named 'output.json' in the specified upload directory.

    Returns:
        JSON response with the content of the JSON file if found.
    """
    json_path = os.path.join(UPLOAD_FOLDER, "output.json")
    if check_for_json():
        try:
            with open(json_path, "r", encoding="utf-8") as json_file:
                json_content = json.load(json_file)
            return (
                jsonify(
                    {
                        "status": "success",
                        "message": "JSON file found.",
                        "json_content": json_content,
                    }
                ),
                200,
            )
        except (json.JSONDecodeError, IOError) as e:
            logger.error("Error reading JSON file: %s", e)
            return (
                jsonify({"status": "error", "message": "Error reading JSON file."}),
                500,
            )

    return jsonify({"status": "error", "message": "JSON file not found."}), 404


@app.route("/upload-csv", methods=["POST"])
def upload_csv():
    """
    Handles the uploading of CSV files via a POST request.

    Returns:
        JSON response with a message and file path on success, or error message on failure.
    """
    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"message": "No file selected"}), 400

    file_path = save_file(file, UPLOAD_FOLDER, {"csv"})
    if not file_path:
        return jsonify({"message": "Invalid file type. Please upload a CSV file."}), 400

    if os.path.getsize(file_path) > MAX_FILE_SIZE:
        os.remove(file_path)
        return jsonify({"message": "File size exceeds the limit."}), 400

    try:
        data_cleaner(file_path)
    except FileNotFoundError:
        os.remove(file_path)
        return jsonify({"message": "File not found."}), 404
    except Exception as e:
        logger.error("Error cleaning data: %s", e)
        os.remove(file_path)
        return jsonify({"message": "Error processing file."}), 500

    return (
        jsonify({"message": "CSV file uploaded successfully.", "file_path": file_path}),
        200,
    )


@app.route("/upload-json", methods=["POST"])
def upload_json():
    """
    Handles the uploading of JSON files via a POST request.

    Returns:
        JSON response with a message and the content of the uploaded JSON file.
    """
    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"message": "No file selected"}), 400

    file_path = save_file(file, UPLOAD_FOLDER, {"json"})
    if not file_path:
        return (
            jsonify({"message": "Invalid file type. Please upload a JSON file."}),
            400,
        )

    try:
        with open(file_path, "r", encoding="utf-8") as json_file:
            json_content = json.load(json_file)
        return (
            jsonify(
                {
                    "message": "JSON file uploaded successfully.",
                    "json_content": json_content,
                }
            ),
            200,
        )
    except IOError as e:
        logger.error("Error reading the JSON file: %s", e)
        return (
            jsonify({"message": "Error reading the JSON file.", "error": str(e)}),
            500,
        )
    except json.JSONDecodeError as e:
        logger.error("Error decoding JSON content: %s", e)
        return (
            jsonify({"message": "Error decoding JSON content.", "error": str(e)}),
            500,
        )
    except Exception as e:
        logger.error("Unexpected error occurred: %s", e)
        return jsonify({"message": "Unexpected error occurred.", "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=DEBUG, port=PORT)
