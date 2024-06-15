import pytest
import io
from Backend.server import save_file
from Backend.images_generator import get_image
from Backend.data_cleaner import data_cleaner
from werkzeug.datastructures import FileStorage
import os

class TestSaveFile:

    # Successfully saves a file with an allowed extension after mocking necessary functions
    def test_save_file_with_allowed_extension_fixed_with_mocking(self, mocker):
        # Arrange
        allowed_extensions = {'txt', 'pdf', 'png'}
        directory = 'test_directory'
        filename = 'test_file.txt'
        file_content = b'This is a test file.'
        file = FileStorage(stream=io.BytesIO(file_content), filename=filename, content_type='text/plain')

        # Mock os.path.exists to return True
        mocker.patch('os.path.exists', return_value=True)
        # Mock file.save method
        mocker.patch.object(FileStorage, 'save')

        # Act
        file_path = save_file(file, directory, allowed_extensions)

        # Assert
        assert file_path == os.path.join(directory, filename)

    # File with a disallowed extension is not saved
    def test_save_file_with_disallowed_extension_fixed(self, mocker):
        from Backend.server import save_file
        from werkzeug.datastructures import FileStorage
        import io

        # Arrange
        allowed_extensions = {'txt', 'pdf', 'png'}
        directory = 'test_directory'
        filename = 'test_file.exe'
        file_content = b'This is a test file.'
        file = FileStorage(stream=io.BytesIO(file_content), filename=filename, content_type='application/octet-stream')

        # Mock os.makedirs to avoid creating actual directories
        mocker.patch('os.makedirs')

        # Act
        file_path = save_file(file, directory, allowed_extensions)

        # Assert
        assert file_path is None

    # Ensures the directory is created before saving the file
    def test_handles_directory_creation_before_saving_file(self, mocker):
        import io
        import os
        import tempfile
        from Backend.server import save_file
        from werkzeug.datastructures import FileStorage

        # Arrange
        allowed_extensions = {'txt', 'pdf', 'png'}
        directory = tempfile.mkdtemp()
        filename = 'test.file.with.dots.txt'
        file_content = b'This is a test file.'
        file = FileStorage(stream=io.BytesIO(file_content), filename=filename, content_type='text/plain')

        # Mock os.path.exists to return False
        mocker.patch('os.path.exists', return_value=False)

        # Mock os.makedirs to ensure directory creation
        mocker.patch('os.makedirs')

        # Act
        file_path = save_file(file, directory, allowed_extensions)

        # Assert
        assert file_path == os.path.join(directory, filename)
        with open(file_path, 'rb') as saved_file:
            saved_file_content = saved_file.read()
            assert saved_file_content == file_content

    # Handles deeply nested directory paths with the recommended fix
    def test_handles_deeply_nested_directory_paths_fixed_with_fix(self, mocker):
        from Backend.server import save_file
        from werkzeug.datastructures import FileStorage
        import os
        import io

        # Arrange
        allowed_extensions = {'txt', 'pdf', 'png'}
        directory = 'test_directory/level1/level2'
        filename = 'test_file.txt'
        file_content = b'This is a test file.'
        file = FileStorage(stream=io.BytesIO(file_content), filename=filename, content_type='text/plain')

        # Mock os.makedirs and file.save
        mocker.patch('os.makedirs')
        mocker.patch.object(file, 'save')

        # Act
        file_path = save_file(file, directory, allowed_extensions)

        # Assert
        assert file_path == os.path.join(directory, filename)
