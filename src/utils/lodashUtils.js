// utils.js

const _ = require('lodash');

// Function to analyze blog data
const analyzeBlogData = (data) => {
  const totalBlogs = data.length;
  const longestBlog = _.maxBy(data, (blog) => blog.title.length);
  const blogsWithPrivacy = _.filter(data, (blog) =>
    blog.title.toLowerCase().includes('privacy')
  );
  const uniqueBlogTitles = _.uniqBy(data, 'title');

  return {
    totalBlogs,
    longestBlog: longestBlog ? longestBlog.title : null,
    blogsWithPrivacy: blogsWithPrivacy.length,
    uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
  };
};

// Function to search blogs
const searchBlogs = (data, query) => {
  const filteredBlogs = data.filter((blog) =>
    blog.title.toLowerCase().includes(query.toLowerCase())
  );
  return filteredBlogs;
};

module.exports = {
  analyzeBlogData,
  searchBlogs,
};
