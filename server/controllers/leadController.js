const Lead = require('../models/Lead');
const Note = require('../models/Note');

exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getLeads = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Symbol.for('or')] = [
        { name: { [Symbol.for('like')]: `%${search}%` } },
        { email: { [Symbol.for('like')]: `%${search}%` } },
        { company: { [Symbol.for('like')]: `%${search}%` } }
      ];
    }
    const leads = await Lead.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });
    const total = await Lead.count({ where });
    res.json({ leads, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, { include: [Note] });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    await lead.update(req.body);
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    await lead.destroy();
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.addNote = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    const note = await Note.create({ text: req.body.text, LeadId: lead.id });
    const updated = await Lead.findByPk(lead.id, { include: [Note] });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
