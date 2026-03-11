import mongoose from "mongoose";

const artworkScheema = new mongoose.Schema({

    artistId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    image : {
        type: String,
        required: true
    },
    price : {
        type: Number,
        required: true
    },
    tags : {
        type: [String],
        required: true
    }

}, {timestamps: true});

const ArtWork = mongoose.model("ArtWork", artworkScheema);
export default ArtWork;