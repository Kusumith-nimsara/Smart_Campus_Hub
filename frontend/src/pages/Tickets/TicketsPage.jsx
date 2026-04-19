import { useState, useCallback } from 'react'
import CreateTicketModal from '../../components/tickets/CreateTicketModal'
import TicketListPage from '../../components/tickets/TicketListPage'

export default function TicketsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTicketCreated = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  return (
    <div>
      <TicketListPage key={refreshKey} onCreateNew={() => setIsModalOpen(true)} />
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  )
}
