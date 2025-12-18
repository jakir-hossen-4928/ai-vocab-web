import Swal, { SweetAlertIcon } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Configuration for the "Toast" notifications (top-right)
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    showCloseButton: true,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const showToast = (title: string, icon: SweetAlertIcon = 'success') => {
    Toast.fire({
        icon,
        title
    });
};

export const showSuccessToast = (title: string) => showToast(title, 'success');
export const showErrorToast = (title: string) => showToast(title, 'error');
export const showInfoToast = (title: string) => showToast(title, 'info');
export const showWarningToast = (title: string) => showToast(title, 'warning');

// Configuration for Confirmation Modals
export const confirmAction = async (
    title: string = 'Are you sure?',
    text: string = "You won't be able to revert this!",
    confirmButtonText: string = 'Yes, delete it!',
    cancelButtonText: string = 'Cancel'
): Promise<boolean> => {
    const result = await MySwal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true, // Often better UX to have cancel on left or right depending on OS, but consistent is key
        focusCancel: true, // Focus cancel by default for safety
    });

    return result.isConfirmed;
};
