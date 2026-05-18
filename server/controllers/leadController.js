const Lead = require('../models/Lead');

exports.createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getLeads = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { company: new RegExp(search, 'i') }
    ];
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page-1)*limit)
      .limit(parseInt(limit));
    const total = await Lead.countDocuments(query);
    res.json({ leads, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.addNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    lead.notes.push({ text: req.body.text });
    await lead.save();
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
