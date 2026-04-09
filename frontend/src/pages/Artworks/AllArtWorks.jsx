import React from 'react'
import { useGetAllArtworksQuery } from '../../redux/api/artwork'
import TiltCard from '../../components/TiltCard'

const AllArtWorks = () => {
  const { data: artworks, isLoading, error } = useGetAllArtworksQuery()

  return (
    <>
      <section className="py-32 px-6" id="discovery">
        <div className="max-w-[90rem] mx-auto">
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: {error.message}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
              {(Array.isArray(artworks) ? artworks : []).map((artwork) => (
                <TiltCard key={artwork._id} artwork={artwork} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default AllArtWorks