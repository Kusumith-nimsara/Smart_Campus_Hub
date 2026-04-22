// Resource API utility functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const getToken = () => localStorage.getItem('authToken') || ''

export const resourceAPI = {
  // Get all resources
  getAllResources: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resources`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      })
      if (!response.ok) {
        console.error('Resources API error:', response.status)
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      throw new Error('Failed to fetch resources from database')
    }
  },

  // Get resource by ID
  getResourceById: async (resourceId) => {
    const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch resource')
    return response.json()
  },

  // Get resources by status
  getResourcesByStatus: async (status) => {
    const response = await fetch(`${API_BASE_URL}/resources/status/${status}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch resources by status')
    return response.json()
  },

  // Get resources by type
  getResourcesByType: async (type) => {
    const response = await fetch(`${API_BASE_URL}/resources/type/${type}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch resources by type')
    return response.json()
  },

  // Get resources by location
  getResourcesByLocation: async (location) => {
    const response = await fetch(`${API_BASE_URL}/resources/location/${location}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch resources by location')
    return response.json()
  },

  // Create resource
  createResource: async (resourceData) => {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(resourceData),
    })
    if (!response.ok) throw new Error('Failed to create resource')
    return response.json()
  },

  // Update resource
  updateResource: async (resourceId, resourceData) => {
    const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(resourceData),
    })
    if (!response.ok) throw new Error('Failed to update resource')
    return response.json()
  },

  // Delete resource
  deleteResource: async (resourceId) => {
    const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete resource')
    return response.status === 204 ? { success: true } : response.json()
  },
}
