const Chat = require('../models/chat.model'); // Assuming you have a Chat model defined

exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find();
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).send('Chat not found');
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchChats =  async (req, res) => {
  try {
    const { search, sort, limit, page } = req.query;

    // Build query object
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }, // Case-insensitive search
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Define sort options
    const sortOptions = {};
    if (sort === 'recent') {
      sortOptions.createdAt = -1; // Sort by most recent
    }

    // Pagination (defaults to 10 items per page)
    const itemsPerPage = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * itemsPerPage;

    // Fetch chats from the database
    const chats = await Chat.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(itemsPerPage);

    // Total count for pagination
    const totalCount = await Chat.countDocuments(query);

    res.json({
      data: chats,
      pagination: {
        total: totalCount,
        page: currentPage,
        itemsPerPage,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.addNewChat = async (req, res) => {
  const imagePath = req.files?.imagePath ? `/${req.files.imagePath[0].filename}` : null;

  const chat = new Chat({
    name: req.body.name,
    description: req.body.description,
    link: req.body.link,
    category: req.body.category,
    imagePath: imagePath,
  });

  try {
    const newChat = await chat.save();
    res.status(201).json(newChat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Update a chat by ID
exports.updateChatById = async (req, res) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedChat) return res.status(404).json({ message: 'Chat not found' });
    res.json(updatedChat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a chat by ID
exports.deleteChatById = async (req, res) => {
  try {
    const deletedChat = await Chat.findByIdAndDelete(req.params.id);
    if (!deletedChat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};