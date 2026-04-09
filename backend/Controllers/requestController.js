import Request from "../Models/Request.js";
import User from "../Models/User.js";

const createRequest = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const request = await Request.findOne({ userId: req.user._id });
        if (request) {
            return res.status(400).json({ errors: [{ msg: "Request already exists" }] });
        }
        await new Request({ userId: req.user._id }).save();
        res.status(201).json({ msg: "Request created successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    };
};

const getRequests = async (req, res) => {
    try {
        const requests = await Request.find().populate("userId", "username email avatar");
        res.status(200).json(requests);
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    };
};

const approveRequest = async (req, res) => {
    try {
        const { id } = req.body;
        const request = await Request.findById(id);
        if (!request) {
            return res.status(404).json({ errors: [{ msg: "Request not found" }] });
        }
        const user = await User.findById(request.userId);
        if (!user) {
            return res.status(404).json({ errors: [{ msg: "User not found" }] });
        }
        user.role = "artist";
        await user.save();
        await Request.findByIdAndDelete(id);
        res.status(200).json({ msg: "Request approved successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ msg: "Server error" }] });
    };
};          

export { createRequest, getRequests, approveRequest };