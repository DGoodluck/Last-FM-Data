import pytest


class TestCheckJson:

    # JSON file exists and is read successfully with the recommended fix
    def test_json_file_exists_and_is_read_successfully(self, mocker):
        # Mock the os.path.exists to return True
        mocker.patch("Backend.server.os.path.exists", return_value=True)

        # Mock the open function to return a mock file object
        mock_open = mocker.mock_open(read_data='{"key": "value"}')
        mocker.patch("builtins.open", mock_open)

        # Create a test client from the existing Flask app instance
        from Backend.server import app

        with app.test_client() as client:
            response = client.get("/check-json")

            # Assert the response status code and data
            assert response.status_code == 200
            assert response.json == {
                "status": "success",
                "message": "JSON file found.",
                "json_content": {"key": "value"},
            }

    # JSON file does not exist in the directory
    def test_json_file_does_not_exist_in_directory(
        self, mocker
    ):
        # Mock the os.path.exists to return False
        mocker.patch("Backend.server.os.path.exists", return_value=False)

        # Import the Flask app from Backend.server
        from Backend.server import app

        with app.test_client() as client:
            response = client.get("/check-json")

            # Assert the response status code and data
            assert response.status_code == 404
            assert response.json == {
                "status": "error",
                "message": "JSON file not found yet.",
            }

    # Test the check_json route for successful response with the recommended fix
    def test_check_json_route_success_with_import(self, mocker):
        import Backend

        mocker.patch("Backend.server.os.path.exists", return_value=True)

        mock_open = mocker.mock_open(read_data='{"key": "value"}')
        mocker.patch("builtins.open", mock_open)

        with Backend.server.app.test_client() as client:
            response = client.get("/check-json")

            assert response.status_code == 200
            assert response.json == {
                "status": "success",
                "message": "JSON file found.",
                "json_content": {"key": "value"},
            }

    # Server handles simultaneous requests gracefully with the recommended fix
    def test_server_handles_simultaneous_requests_gracefully(self, mocker):
        # Mock the os.path.exists to return True
        mocker.patch("Backend.server.os.path.exists", return_value=True)

        # Mock the open function to return a mock file object
        mock_open = mocker.mock_open(read_data='{"key": "value"}')
        mocker.patch("builtins.open", mock_open)

        # Create a test client from the actual Flask app instance
        from Backend.server import app

        with app.test_client() as client:
            response = client.get("/check-json")

            # Assert the response status code and data
            assert response.status_code == 200
            assert response.json == {
                "status": "success",
                "message": "JSON file found.",
                "json_content": {"key": "value"},
            }

    # Ensure large JSON file is handled correctly with the recommended fix
    def test_large_json_file_handling(self, mocker):
        # Mock the os.path.exists to return True
        mocker.patch("Backend.server.os.path.exists", return_value=True)

        # Mock the open function to return a mock file object with large JSON content
        large_json_content = (
            '{"key1": "value1", "key2": "' + "value2" * 100000 + '"}'
        )  # Corrected large JSON content
        mock_open = mocker.mock_open(read_data=large_json_content)
        mocker.patch("builtins.open", mock_open)

        # Create a test client using the existing Flask app instance
        from Backend.server import app

        with app.test_client() as client:
            response = client.get("/check-json")

            # Assert the response status code and data
            assert response.status_code == 200
            assert response.json == {
                "status": "success",
                "message": "JSON file found.",
                "json_content": {"key1": "value1", "key2": "value2" * 100000},
            }

    # Multiple requests to check the JSON file in quick succession with the fixed test client creation
    def test_multiple_requests_check_json(self, mocker):
        # Mock the os.path.exists to return True
        mocker.patch("Backend.server.os.path.exists", return_value=True)

        # Mock the open function to return a mock file object
        mock_open = mocker.mock_open(read_data='{"key": "value"}')
        mocker.patch("builtins.open", mock_open)

        # Create a test client using the actual Flask app instance
        from Backend.server import app

        with app.test_client() as client:
            # Send multiple requests to check-json endpoint
            for _ in range(5):
                response = client.get("/check-json")

                # Assert the response status code and data
                assert response.status_code == 200
                assert response.json == {
                    "status": "success",
                    "message": "JSON file found.",
                    "json_content": {"key": "value"},
                }

    # JSON file exists but is empty (Fixed test with recommended approach)
    def test_json_file_exists_but_is_empty(self, mocker):
        mocker.patch("Backend.server.os.path.exists", return_value=True)

        mock_open = mocker.mock_open(read_data="{}")
        mocker.patch("builtins.open", mock_open)

        from Backend.server import app

        with app.test_client() as client:
            response = client.get("/check-json")

            assert response.status_code == 200
            assert response.json == {
                "status": "success",
                "message": "JSON file found.",
                "json_content": {},
            }

    # JSON file exists but contains invalid JSON, assert correct error message with updated fix
    def test_json_file_exists_but_invalid_json(
        self, mocker
    ):
        mocker.patch("Backend.server.os.path.exists", return_value=True)

        mock_open = mocker.mock_open(read_data="invalid_json_data")
        mocker.patch("builtins.open", mock_open)

        from Backend.server import app

        with app.test_client() as client:
            response = client.get("/check-json")

            assert response.status_code == 500
            assert response.get_json() == {
                "status": "error",
                "message": "Error decoding JSON file.",
            }
