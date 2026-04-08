import React, { useEffect } from "react";
import { useGetArtworksbyArtistIdQuery, useDeleteArtworkMutation } from "../../redux/api/artwork";
import TiltCard from "../../components/TiltCard";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const MyArtWorks = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: artworks, isLoading, error, refetch } = useGetArtworksbyArtistIdQuery(userInfo._id);
  const [deleteArtwork] = useDeleteArtworkMutation();

  useEffect(() => {
    refetch();
  }, [artworks]);

  const handleDelete = async (id) => {
    try {
      await deleteArtwork(id).unwrap();
      toast.success("Artwork deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

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
              {artworks.map((artwork) => (
                <TiltCard key={artwork._id} artwork={artwork} handleDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default MyArtWorks;
