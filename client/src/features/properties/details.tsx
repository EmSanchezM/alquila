import { FC } from 'react'

interface PropertiesDetailsProps {
  property: {
    id: string
    title: string
    body: string
  }
}

const PropertiesDetails: FC<PropertiesDetailsProps> = ({ property }) => {
  return (
    <section className="grid gap-2">
      <h2 className="text-lg">
        <strong>Property No.</strong> #{property.id.toString().padStart(2, '0')}
      </h2>
      <p>
        <strong>property title:</strong> {property.title}
      </p>
      <p>
        <strong>property body:</strong> {property.body}
      </p>
    </section>
  )
}

export default PropertiesDetails