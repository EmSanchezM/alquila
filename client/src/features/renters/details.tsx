import { FC } from 'react'

interface RentersDetailsProps {
  renter: {
    id: string
    title: string
    body: string
  }
}

const RentersDetails: FC<RentersDetailsProps> = ({ renter }) => {
  return (
    <section className="grid gap-2">
      <h2 className="text-lg">
        <strong>Renter No.</strong> #{renter.id.toString().padStart(2, '0')}
      </h2>
      <p>
        <strong>renter title:</strong> {renter.title}
      </p>
      <p>
        <strong>renter body:</strong> {renter.body}
      </p>
    </section>
  )
}

export default RentersDetails