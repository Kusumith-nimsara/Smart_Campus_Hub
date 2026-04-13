import Swal from 'sweetalert2'

const baseOptions = {
  width: 600,
  background: '#ffffff',
  color: '#111827',
  iconColor: '#2563eb',
  confirmButtonColor: '#2563eb',
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
    iconColor: '#059669',
    confirmButtonColor: '#059669',
    title,
    text,
    customClass: {
      ...baseOptions.customClass,
      popup: 'sc-swal-popup sc-swal-success',
    },
  })
}

export function showError(title, text = '') {
  return Swal.fire({
    ...baseOptions,
    icon: 'error',
    iconColor: '#dc2626',
    confirmButtonColor: '#dc2626',
    title,
    text,
    customClass: {
      ...baseOptions.customClass,
      popup: 'sc-swal-popup sc-swal-error',
    },
  })
}

export function showInfo(title, text = '') {
  return Swal.fire({
    ...baseOptions,
    icon: 'info',
    iconColor: '#7c3aed',
    confirmButtonColor: '#7c3aed',
    title,
    text,
    customClass: {
      ...baseOptions.customClass,
      popup: 'sc-swal-popup sc-swal-info',
    },
  })
}

export function showLogoutAlert() {
  return Swal.fire({
    ...baseOptions,
    icon: 'info',
    iconColor: '#7c3aed',
    confirmButtonColor: '#7c3aed',
    title: 'Info',
    text: 'Logged out successfully.',
    confirmButtonText: 'OK',
    customClass: {
      ...baseOptions.customClass,
      popup: 'sc-swal-popup sc-swal-info',
    },
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
    iconColor: '#b45309',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor,
    reverseButtons: true,
    customClass: {
      ...baseOptions.customClass,
      popup: 'sc-swal-popup sc-swal-warning',
    },
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
