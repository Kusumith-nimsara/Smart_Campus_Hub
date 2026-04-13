import Swal from 'sweetalert2'

const baseOptions = {
  confirmButtonColor: '#4f46e5',
  background: '#ffffff',
  color: '#0f172a',
}

export function showSuccess(title, text = '') {
  return Swal.fire({
    ...baseOptions,
    icon: 'success',
    title,
    text,
  })
}

export function showError(title, text = '') {
  return Swal.fire({
    ...baseOptions,
    icon: 'error',
    title,
    text,
  })
}

export function showInfo(title, text = '') {
  return Swal.fire({
    ...baseOptions,
    icon: 'info',
    title,
    text,
  })
}

export async function confirmAction({
  title,
  text,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  confirmButtonColor = '#dc2626',
}) {
  const result = await Swal.fire({
    ...baseOptions,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor,
    reverseButtons: true,
  })

  return result.isConfirmed
}

export function showToast(title, icon = 'success') {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
    icon,
    title,
  })
}
