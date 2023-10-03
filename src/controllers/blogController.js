const fetch = require("node-fetch");
const _ = require("lodash");

const blogApiUrl = "https://intent-kit-16.hasura.app/api/rest/blogs";
const hasuraAdminSecret =
  "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6";

// Function to fetch blog data from the API
const fetchBlogData = async () => {
  try {
    const options = {
      method: "GET",
      headers: {
        "x-hasura-admin-secret": hasuraAdminSecret,
      },
    };

    const response = await fetch(blogApiUrl, options);
    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching blog data:", error);
    throw error; // Re-throw the error to propagate it
  }
};

// Function to analyze blog data
const analyzeBlogData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      totalBlogs: 0,
      longestBlog: null,
      blogsWithPrivacy: 0,
      uniqueBlogTitles: [],
    };
  }

  const totalBlogs = data.length;
  const longestBlog = _.maxBy(data, (blog) =>
    blog.title ? blog.title.length : 0
  );
  const blogsWithPrivacy = _.filter(data, (blog) =>
    blog.title ? blog.title.toLowerCase().includes("privacy") : false
  );
  const uniqueBlogTitles = _.uniqBy(data, "title");

  return {
    totalBlogs,
    longestBlog: longestBlog ? longestBlog.title : null,
    blogsWithPrivacy: blogsWithPrivacy.length,
    uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
  };
};

// Function to search blogs
const searchBlogs = (query, data) => {
  console.log("SearchBlogs called with query:", query);
  console.log("Data type:", typeof data);
  console.log(
    "Data structure:",
    Array.isArray(data) ? "Array" : "Not an Array"
  );

  if (!query) {
    return Promise.reject({ error: "Query parameter is required" });
  }

  // Validate data format
  if (
    !Array.isArray(data) ||
    !data.every((blog) => typeof blog === "object" && blog.title)
  ) {
    console.error("Invalid data format. Data is not an array of blog objects.");
    return Promise.reject({ error: "Invalid data format" });
  }

  // Wrap the filter operation in a Promise
  return new Promise((resolve, reject) => {
    try {
      const filteredBlogs = data.filter((blog) =>
        blog.title.toLowerCase().includes(query.toLowerCase())
      );

      resolve(filteredBlogs); // Resolve with the filtered blogs
    } catch (error) {
      reject(error); // Reject with the error if the filtering fails
    }
  }).catch((error) => {
    console.error("SearchBlogs Promise Error:", error);
    throw error; // Rethrow the error to be handled globally
  });
};

// Configure Lodash cache
_.memoize.Cache = Map; // Set up a cache using a Map

// Wrap fetchBlogData with memoization
const memoizedFetchBlogData = _.memoize(fetchBlogData, (query) => query, {
  promise: true,
});

// Wrap searchBlogs with memoization
const memoizedSearchBlogs = _.memoize(searchBlogs, (query) => query, {
  promise: true,
});

// Export controller functions
module.exports = {
  getBlogStats: async (req, res) => {
    try {
      const data = await memoizedFetchBlogData(); // Use memoizedFetchBlogData

      // Check if data is undefined or empty
      if (!data || data.length === 0) {
        return res.status(404).json({ error: "No blog data available" });
      }

      const analytics = analyzeBlogData(data);
      res.json(analytics);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  searchBlogs: async (req, res) => {
    const { query } = req.query;
    try {
      const data = await memoizedFetchBlogData();
      const filteredBlogs = memoizedSearchBlogs(query, data);
      res.json(filteredBlogs);
    } catch (error) {
      console.error("Error in searchBlogs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
