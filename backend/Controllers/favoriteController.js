import Favorite from "../Models/Favorite.js";

const addFavorite = async (req, res) => {
    try {
        const { artworkId } = req.body;
        const favorite = new Favorite({ userId: req.user._id, artworkId });
        await favorite.save();
        res.status(201).json(favorite);
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
};

const removeFavorite = async (req, res) => {
    try {
        const { userId, artworkId } = req.body;
        const favorite = await Favorite.findOne({ userId, artworkId });
        if (!favorite) {
            return res.status(404).json({ errors: [{ msg: "Favorite not found" }] });
        }
        await favorite.remove();
        res.status(200).json({ msg: "Favorite removed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
};

const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user._id });
        res.status(200).json(favorites);
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
};  

export {
    addFavorite,
    removeFavorite,
    getFavorites
};