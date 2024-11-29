import { toast } from "react-toastify";

class ToastsService {
    /**
     * Show a success toast notification
     * @param {string} message - The message to display
     * @private
     */
    async showSuccessToast(message) {
        toast.success(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    }

    /**
     * Show an error toast notification
     * @param {string} message - The message to display
     * @private
     */
    async showErrorToast(message) {
        toast.error(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    }
}

export default ToastsService;