const { Op, fn, col } = require('sequelize');
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
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } },
        { source: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const leads = await Lead.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit, 10)
    });
    const total = await Lead.count({ where });
    res.json({ leads, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getSummary = async (req, res) => {
  try {
    const total = await Lead.count();
    const statusRows = await Lead.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status']
    });
    const sourceRows = await Lead.findAll({
      attributes: ['source', [fn('COUNT', col('id')), 'count']],
      group: ['source']
    });

    const statusCounts = statusRows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.dataValues.count, 10);
      return acc;
    }, {});
    const sourceCounts = sourceRows.reduce((acc, row) => {
      acc[row.source || 'Unknown'] = parseInt(row.dataValues.count, 10);
      return acc;
    }, {});

    res.json({ total, statusCounts, sourceCounts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getActivity = async (req, res) => {
  try {
    const notes = await Note.findAll({
      include: [{ model: Lead, attributes: ['id', 'name', 'company'] }],
      order: [['createdAt', 'DESC']],
      limit: 6
    });

    const activity = notes.map((note) => ({
      id: note.id,
      text: note.text,
      createdAt: note.createdAt,
      leadId: note.Lead?.id,
      leadName: note.Lead?.name,
      company: note.Lead?.company
    }));

    res.json({ activity });
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
    await Note.create({ text: req.body.text, LeadId: lead.id });
    const updated = await Lead.findByPk(lead.id, { include: [Note] });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
