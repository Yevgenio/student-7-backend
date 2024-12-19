const Deal = require('../models/deal.model');
const Chat = require('../models/chat.model'); 
const Search = require('../models/search.model'); 
// const User = require('../models/user.model'); 

exports.globalSearch = async (req, res) => {
    const { query, limit } = req.query;
    const searchQuery = {};
  
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ];
    }
  
    const searchLimit = parseInt(limit) || 30;
  
    try {
      const [deals, chats] = await Promise.all([
        Deal.find(searchQuery).limit(searchLimit),
        Chat.find(searchQuery).limit(searchLimit),
      ]);
  
      res.json({
        deals,
        chats,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.getSearchLogHistory = async (req, res) => {
    try {
      const searches = await Search.find();
      res.json(searches);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  exports.getSearchLogById = async (req, res) => {
  try {
    const search = await Chat.findById(req.params.id);
    if (!search) {
      return res.status(404).send('Search not found');
    }
    res.json(search);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSearchLogByQuery =  async (req, res) => {
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

    // Fetch searches from the database
    const searches = await Search.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(itemsPerPage);

    // Total count for pagination
    const totalCount = await Search.countDocuments(query);

    res.json({
      data: searches,
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

  