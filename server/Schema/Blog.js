const mongoose = require("mongoose");
const { Schema } = mongoose;

const blogSchema = new mongoose.Schema(
  {
    blog_id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      // required: true,
    },
    desc: {
      type: String,
      maxlength: 200,
      // required: true,
    },
    content: {
      type: [],
      // required: true,
    },
    tags: {
      type: [String],
      // required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    activity: {
      total_likes: {
        type: Number,
        default: 0,
      },
      total_comments: {
        type: Number,
        default: 0,
      },
      total_reads: {
        type: Number,
        default: 0,
      },
      total_parent_comments: {
        type: Number,
        default: 0,
      },
    },
    comments: {
      type: [Schema.Types.ObjectId],
      ref: "Comment",
    },
    draft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "publishedAt",
    },
  }
);

module.exports = mongoose.model("Blog", blogSchema);
