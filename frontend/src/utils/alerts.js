import Swal from 'sweetalert2'

const baseOptions = {
  width: 600,
  background: '#ffffff',
  color: '#0f172a',
  iconColor: '#0ea5e9',
  confirmButtonColor: '#0ea5e9',
  showClass: {
    popup: 'sc-swal-show',
  },
  hideClass: {
    popup: 'sc-swal-hide',
  },
  customClass: {
    popup: 'sc-swal-popup',
    title: 'sc-swal-title',
    htmlContainer: 'sc-swal-text',
    confirmButton: 'sc-swal-confirm',
    cancelButton: 'sc-swal-cancel',
    actions: 'sc-swal-actions',
    icon: 'sc-swal-icon',
  },
}

const toastBaseOptions = {
  toast: true,
  position: 'center',
  showConfirmButton: false,
  timer: 2600,
  timerProgressBar: true,
  showClass: {
    popup: 'sc-toast-show',
  },
  hideClass: {
    popup: 'sc-toast-hide',
  },
  customClass: {
    title: 'sc-toast-title',
    timerProgressBar: 'sc-toast-progress',
    icon: 'sc-toast-icon',
  },
}

function getToastPopupClass(icon, size) {
  const normalizedIcon = ['success', 'error', 'warning', 'info', 'question'].includes(icon)
    ? icon
    : 'success'

  const sizeClass = size === 'compact' ? 'sc-toast-compact' : 'sc-toast-large'
  return `sc-toast-popup sc-toast-${normalizedIcon} ${sizeClass}`
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

export function showLogoutAlert() {
  return Swal.fire({
    ...baseOptions,
    icon: 'info',
    title: 'Info',
    text: 'Logged out successfully.',
    confirmButtonText: 'OK',
  })
}

export function showRunning(title = 'Please wait', text = 'Processing your request...') {
  return Swal.fire({
    ...baseOptions,
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

export function closeAlert() {
  Swal.close()
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

export function showToast(title, icon = 'success', size = 'large') {
  return Swal.fire({
    ...toastBaseOptions,
    icon,
    title,
    customClass: {
      ...toastBaseOptions.customClass,
      popup: getToastPopupClass(icon, size),
    },
  })
}
