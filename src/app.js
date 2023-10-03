const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Import routes
const blogRoutes = require('./routes/blogRoutes');

// Use routes
app.use('/api', blogRoutes);

// Express route handler for /api/blog-search
app.get('/api/blog-search', async (req, res) => {
  const { query } = req.query;

  try {
    const data = await memoizedFetchBlogData();

    // Log the data structure for debugging
    console.log('Data structure:', typeof data);

    if (!Array.isArray(data) || !data.every((blog) => typeof blog === 'object' && blog.title)) {
      // Handle the case where data is not an array of blog objects
      console.error('Invalid data format. Data is not an array of blog objects.');
      return res.status(500).json({ error: 'Invalid data format' });
    }

    const filteredBlogs = await memoizedSearchBlogs(query, data)
      .catch((error) => {
        // Handle errors from memoizedSearchBlogs
        console.error('Error in memoizedSearchBlogs:', error);
        throw error; // Rethrow the error to be handled globally
      });

    // Log the contents of data and filteredBlogs for debugging
    console.log('Data Type:', typeof data);
    console.log('Filtered Blogs Type:', typeof filteredBlogs);

    if (Array.isArray(filteredBlogs)) {
      res.json(filteredBlogs);
    } else {
      res.status(400).json({ error: 'Invalid data format' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Express route handler for /api/blog-stats
app.get('/api/blog-stats', async (req, res) => {
  try {
    const data = await fetchBlogData();

    // Debugging: Log the data received from the API
    console.log('Data from API:', data);

    const analytics = analyzeBlogData(data);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching or analyzing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Define a route for the root URL ("/")
app.get('/', (req, res) => {
  res.send('Welcome to the Blog Analytics and Search Tool');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

