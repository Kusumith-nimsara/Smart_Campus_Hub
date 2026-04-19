// Ticket API utility functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const getToken = () => localStorage.getItem('authToken') || ''

export const ticketAPI = {
  // User operations
  createTicket: async (ticketData) => {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(ticketData),
    })
    if (!response.ok) throw new Error('Failed to create ticket')
    return response.json()
  },

  getUserTickets: async (page = 0, size = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/tickets?page=${page}&size=${size}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch tickets')
    return response.json()
  },

  getTicketById: async (ticketId) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch ticket')
    return response.json()
  },

  uploadImage: async (ticketId, imageBase64) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ imageBase64 }),
    })
    if (!response.ok) throw new Error('Failed to upload image')
    return response.json()
  },

  addComment: async (ticketId, content) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ content }),
    })
    if (!response.ok) throw new Error('Failed to add comment')
    return response.json()
  },

  deleteComment: async (ticketId, commentId) => {
    const response = await fetch(
      `${API_BASE_URL}/tickets/${ticketId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to delete comment')
    return response.json()
  },

  // Admin operations
  getAllTickets: async (page = 0, size = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/tickets/admin/all?page=${page}&size=${size}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch tickets')
    return response.json()
  },

  assignTechnician: async (ticketId, technicianId) => {
    const response = await fetch(
      `${API_BASE_URL}/tickets/${ticketId}/assign?technicianId=${technicianId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to assign technician')
    return response.json()
  },

  updateStatus: async (ticketId, status, rejectionReason = '') => {
    const params = new URLSearchParams({ status })
    if (rejectionReason) params.append('rejectionReason', rejectionReason)
    
    const response = await fetch(
      `${API_BASE_URL}/tickets/${ticketId}/status?${params}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to update status')
    return response.json()
  },

  updateResolutionNotes: async (ticketId, notes) => {
    const response = await fetch(
      `${API_BASE_URL}/tickets/${ticketId}/resolution-notes`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ notes }),
      }
    )
    if (!response.ok) throw new Error('Failed to update resolution notes')
    return response.json()
  },

  getTechnicianTickets: async (page = 0, size = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/tickets/technician/assigned?page=${page}&size=${size}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch technician tickets')
    return response.json()
  },

  getTicketsByStatus: async (status, page = 0, size = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/tickets/status/${status}?page=${page}&size=${size}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }
    )
    if (!response.ok) throw new Error('Failed to fetch tickets')
    return response.json()
  },
}
