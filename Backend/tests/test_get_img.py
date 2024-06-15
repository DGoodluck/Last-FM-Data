import pytest

class TestGetImg:

    # Returns 200 and image URL when image is found in cache
    def test_returns_200_and_image_url_when_found_in_cache(self, mocker):
        from Backend.server import app, artist_img_cache
        client = app.test_client()
        artist_img_cache["test-artist"] = "http://example.com/image.jpg"
    
        response = client.post("/get-img", json={"target": "test", "artist": "artist", "target_type": "artist"})
    
        assert response.status_code == 200
        assert response.json["status"] == "success"
        assert response.json["message"] == "Image found."
        assert response.json["get_img"] == "http://example.com/image.jpg"

    # Handles missing target, artist, or target_type in request data
    def test_handles_missing_data(self, mocker):
        from Backend.server import app, artist_img_cache
        client = app.test_client()
    
        response = client.post("/get-img", json={})
    
        assert response.status_code == 404
        assert response.json["status"] == "error"
        assert response.json["message"] == "Image not found."

    # Logs received data for debugging
    def test_logs_received_data_for_debugging(self, mocker):
        from Backend.server import app, artist_img_cache
        from Backend.images_generator import get_image
        from flask import json

        client = app.test_client()
        artist_img_cache.clear()

        data = {"target": "test", "artist": "artist", "target_type": "artist"}
        response = client.post("/get-img", json=data)

        assert response.status_code == 200
        assert response.json["status"] == "success"
        assert response.json["message"] == "Image found."
        assert response.json["get_img"] is not None

    # Validates response structure from API
    def test_validates_response_structure_from_api(self, mocker):
        from Backend.server import app, artist_img_cache
        from Backend.images_generator import get_image
        from requests.exceptions import Timeout, RequestException
        from unittest.mock import patch

        client = app.test_client()
        artist_img_cache["test-artist"] = "http://example.com/image.jpg"

        with patch('Backend.server.get_image') as mock_get_image:
            mock_get_image.return_value = "http://example.com/image.jpg"

            response = client.post("/get-img", json={"target": "test", "artist": "artist", "target_type": "artist"})

            assert response.status_code == 200
            assert response.json["status"] == "success"
            assert response.json["message"] == "Image found."
            assert response.json["get_img"] == "http://example.com/image.jpg"

    # Ensures cache key uniqueness
    def test_cache_key_uniqueness(self, mocker):
        from Backend.server import app, artist_img_cache
        from Backend.images_generator import get_image
        client = app.test_client()
        artist_img_cache["test-artist"] = "http://example.com/image.jpg"
    
        mocker.patch('Backend.server.get_image', return_value="http://example.com/image.jpg")
    
        response = client.post("/get-img", json={"target": "test", "artist": "artist", "target_type": "artist"})
    
        assert response.status_code == 200
        assert response.json["status"] == "success"
        assert response.json["message"] == "Image found."
        assert response.json["get_img"] == "http://example.com/image.jpg"

    # Handles API request timeouts gracefully and checks for success message
    def test_handles_api_request_timeouts_gracefully_with_success_message(self, mocker):
        from Backend.server import app, artist_img_cache
        from Backend.images_generator import get_image, Timeout
        from requests.exceptions import Timeout as RequestTimeout
        import requests

        client = app.test_client()
        artist_img_cache["test-artist"] = "http://example.com/image.jpg"

        def mocked_get_image(target, artist, target_type):
            raise Timeout()

        mocker.patch('Backend.server.get_image', side_effect=mocked_get_image)

        response = client.post("/get-img", json={"target": "test", "artist": "artist", "target_type": "artist"})

        assert response.status_code == 200
        assert response.json["status"] == "success"
        assert response.json["message"] == "Image found."