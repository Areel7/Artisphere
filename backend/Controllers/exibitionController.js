import Exibition from "../Models/Exibition.js";

const createExibition = async (req, res) => {
  try {
    const { title, description, startDate, endDate, artworkIds } = req.body;
    const exibition = new Exibition({
      title,
      description,
      startDate,
      endDate,
      curatorId: req.user._id,
      artworkIds,
    });
    await exibition.save();
    res.status(201).json(exibition);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getAllExibitions = async (req, res) => {
  try {
    const exibitions = await Exibition.find({});
    res.status(200).json(exibitions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const getExibitionById = async (req, res) => {
  try {
    const exibition = await Exibition.findById(req.params.id);
    if (!exibition) {
      return res.status(404).json({ errors: [{ msg: "Exibition not found" }] });
    }
    res.status(200).json(exibition);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

export { createExibition, getAllExibitions, getExibitionById };
