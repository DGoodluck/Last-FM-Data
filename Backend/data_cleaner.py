import os
import logging
import pandas as pd
import numpy as np
from tzlocal import get_localzone

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def data_cleaner(file_path: str) -> None:
    """
    Reads a CSV file, cleans the data, converts date strings to Unix timestamps, and saves as JSON.

    Args:
        file_path (str): The path to the CSV file to be processed.
    """
    column_names = ["Artist", "Album", "Title", "Date"]

    if not os.path.exists(file_path):
        logger.error("File not found: %s", file_path)
        return

    try:
        df = pd.read_csv(file_path, names=column_names)

        if df.empty:
            logger.warning("CSV file is empty.")
            return

        # Drop rows with any missing values
        df.dropna(inplace=True)

        # Convert 'Date' column to datetime, localize to UTC and convert to local time zone
        df["Date"] = pd.to_datetime(df["Date"], format="%d %b %Y %H:%M", errors='coerce').dropna()
        local_tz = get_localzone()
        df["Date"] = df["Date"].dt.tz_localize("UTC").dt.tz_convert(local_tz)

        # Convert dates to Unix timestamps (milliseconds)
        df["Date"] = df["Date"].astype(np.int64) // 10**6

        # Construct output file path and save the cleaned data as JSON
        output_dir = os.path.join("uploads")
        os.makedirs(output_dir, exist_ok=True)
        output_json_path = os.path.join(output_dir, "output.json")
        df.to_json(output_json_path, orient="records", indent=4)

        logger.info("Data cleaned and saved to JSON: %s", output_json_path)

    except pd.errors.EmptyDataError:
        logger.error("CSV file is empty.")
    except ValueError as ve:
        logger.error("Value error occurred: %s", ve)
    except Exception as e:
        logger.error("An unexpected error occurred: %s", e)