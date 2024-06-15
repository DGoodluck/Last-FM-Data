import axios from 'axios';

/**
 * Custom hook to fetch an image from a server.
 * @returns {Function} Function to fetch image.
 */
export const useFetchImage = () => {
    /**
     * Fetches an image based on provided parameters.
     * @param {string} target - The target type of the image (song name, album name).
     * @param {string} [artist=''] - The name of the artist (optional).
     * @param {string} targetType - The type of the target.
     * @returns {Promise<string>} A promise that resolves with the image data if successful.
     */
    const fetchImage = async (target, artist = '', targetType) => {
        try {
            const requestBody = {
                target,
                artist,
                target_type: targetType
            };

            const response = await axios.post('http://localhost:5173/get-img', requestBody);

            if (response.status === 200) {
                return response.data.get_img;
            }
        } catch (error) {
            console.error(`Error fetching ${target} image:`, error);
        }
    };

    return fetchImage;
};