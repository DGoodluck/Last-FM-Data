from typing import Optional
import re
import logging
import requests
from requests.exceptions import RequestException, Timeout

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_image(target: str, artist: Optional[str], target_type: str) -> Optional[str]:
    """
    Fetches an image URL for an artist, album, or song from the Deezer API
    based on the provided target, artist, and target type.

    Args:
        target (str): The name of the artist, album, or song.
        artist (Optional[str]): The name of the artist (used only for album and song types).
        target_type (str): The type of target, which can be 'artist', 'album', or 'song'.

    Returns:
        Optional[str]: The URL of the image if found, otherwise None.
    """

    def clean_query(query: str) -> str:
        """
        Cleans query strings by replacing spaces with hyphens and removing text within parentheses.

        Args:
            query (str): The query string to clean.

        Returns:
            str: The cleaned query string.
        """
        query = query.replace(" ", "-")
        query = re.sub(r"\(.*?\)\ *", "", query)
        return query

    # Map target types to the appropriate Deezer search endpoints and the key for the image URL
    endpoint_map = {
        "artist": ("artist", "picture_medium"),
        "album": ("album", "cover_medium"),
        "song": ("track", "album"),
    }

    if target_type not in endpoint_map:
        logger.error("Invalid target type: %s", target_type)
        return None

    # Construct the query and URL based on the target type
    try:
        if target_type == "artist":
            query = clean_query(target)
        else:
            query = clean_query(f"{target}-{artist}")

        endpoint, image_key = endpoint_map[target_type]
        url = f"https://api.deezer.com/search/{endpoint}?q={query}"

        logger.info("Fetching image from URL: %s", url)

        response = requests.get(url, timeout=5)
        response.raise_for_status()
        response_json = response.json()

        if not response_json.get("data"):
            logger.warning("No data found in the API response.")
            return None

        first_result = response_json["data"][0]

        if target_type == "song":
            # For songs, the image URL is nested inside the album data
            return first_result.get("album", {}).get(image_key, None)

        return first_result.get(image_key, None)

    except (Timeout, RequestException) as e:
        logger.error("Request error while fetching image: %s", e)
    except ValueError as ve:
        logger.error("Value error: %s", ve)
    except KeyError as ke:
        logger.error("Key error: %s", ke)
    except Exception as e:
        logger.error("Unexpected error: %s", e)

    return None


if __name__ == "__main__":
    image_url = get_image("MADRA", "NewDad", "album")
    if image_url:
        logger.info("Image URL: %s", image_url)
    else:
        logger.warning("Image not found.")
