const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("./Schema/User");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("../server/blog-site-78ad5-firebase-adminsdk-dassn-4181be6b7d.json");
const { getAuth } = require("firebase-admin/auth");
const aws = require("aws-sdk");
const Blog = require("./Schema/Blog");
const Notification = require("./Schema/Notification");

const app = express();
app.use(express.json());
dotenv.config();
app.use(cors());
mongoose.connect(process.env.MONGO_URL);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadUrl = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "mern-blog-site",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

const getUserName = async (email) => {
  try {
    let username = email.split("@")[0];
    let isUsernameExists = await User.exists({
      "personal_info.username": username,
    });

    isUsernameExists ? (username += nanoid().substring(0, 5)) : username;

    return username;
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const formattedDataSend = (user) => {
  const token = jwt.sign({ id: user._id }, process.env.TOKEN_KEY);

  return {
    token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const verifyToken = (req, res, next) => {
  const authHeaders = req.headers.authorization;
  const token = authHeaders?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No access token" });
  }

  jwt.verify(token, process.env.TOKEN_KEY, (error, user) => {
    if (error) {
      return res.status(403).json({ error: "Access token is invalid" });
    }

    req.user = user.id;
    next();
  });
};

app.post("/signup", (req, res) => {
  const { fullname, email, password } = req.body;

  bcrypt.hash(password, 10, async (error, encrypted_password) => {
    try {
      const username = await getUserName(email);
      const user = new User({
        personal_info: {
          fullname,
          email,
          password: encrypted_password,
          username,
        },
      });
      const userData = await user.save();
      return res.status(200).json(formattedDataSend(userData));
    } catch (error) {
      if (error.code === 11000) {
        return res.status(403).json({ error: "Email already exists" });
      }
      return res.status(500).json({ error: error.message });
    }
  });
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ "personal_info.email": email });

    if (!user) {
      return res.status(403).json({ error: "Email not found!" });
    }

    if (user.google_auth === true) {
      return res.status(403).json({
        error: "Account was created using google. Try logging in with google.",
      });
    }

    bcrypt.compare(password, user.personal_info.password, (error, result) => {
      if (!result) {
        return res.status(403).json({ error: "Incorrect password" });
      } else {
        return res.status(200).json(formattedDataSend(user));
      }
    });
  } catch (err) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/google-auth", async (req, res) => {
  const { token } = req.body;

  getAuth()
    .verifyIdToken(token)
    .then(async (decodedUser) => {
      const { email, name, picture } = decodedUser;
      const highResolutionPic = picture.replace("s96-c", "s-384c");

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
        )
        .then((u) => {
          return u || null;
        })
        .catch((error) => {
          return res.status(500).json({ error: error.message });
        });

      if (user) {
        if (user.google_auth === false) {
          return res.status(403).json({
            error:
              "This email was signed up without google. Please log in with password to access account.",
          });
        }
      } else {
        try {
          let username = await getUserName(email);

          user = new User({
            personal_info: {
              fullname: name,
              email,
              username,
            },
            google_auth: true,
          });

          user = await user.save();
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
      }

      return res.status(200).json(formattedDataSend(user));
    })
    .catch((error) => {
      return res.status(500).json({
        error:
          "Failed to authenticate you eith google. Try with some other google account.",
      });
    });
});

app.get("/get-upload-url", async (req, res) => {
  try {
    const url = await generateUploadUrl();
    return res.status(200).json({ uploadUrl: url });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/create-blog", verifyToken, async (req, res) => {
  const authorId = req.user;

  let { title, desc, bannerImage, content, tags, draft, id } = req.body;

  // We have already done client side validation but doing it again on server side to make
  // app more secure.

  if (!title.length) {
    return res.status(403).json({ error: "Must provide a title for blog" });
  }

  if (!draft) {
    if (!desc.length || desc.length > 200) {
      return res.status(403).json({
        error: "Must provide a blog description under 200 charachters",
      });
    }

    if (!bannerImage.length) {
      return res
        .status(403)
        .json({ error: "Must provide banner image to publish blog" });
    }

    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    }

    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Must provide tag to publish a blog, maximum limit is 10",
      });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  const blog_id =
    id ||
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  if (id) {
    try {
      const data = await Blog.findOneAndUpdate(
        { blog_id },
        { title, desc, bannerImage, content, tags, draft: Boolean(draft) }
      );

      return res.status(200).json({ id: blog_id });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    let blog = new Blog({
      title,
      desc,
      bannerImage,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft),
    });

    try {
      const data = await blog.save();

      let incrementalVal = draft ? 0 : 1;

      try {
        await User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { "account_info.total_posts": incrementalVal },
            $push: { blogs: data._id },
          }
        );

        return res.status(200).json({ id: data.blog_id });
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Failed to update the total posts count" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
});

app.post("/latest-blogs", async (req, res) => {
  const { page } = req.body;
  const maxLimit = 5;
  try {
    const blogsData = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title desc bannerImage activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs: blogsData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/trending-blogs", async (req, res) => {
  try {
    const trendingBlogsData = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      )
      .sort({
        "activity.total_reads": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt -_id")
      .limit(5);

    return res.status(200).json({ blogs: trendingBlogsData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/search-blogs", async (req, res) => {
  const { tag, query, author, page, limit, eliminate_blog } = req.body;
  const maxLimit = limit ? limit : 2;
  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  try {
    const blogsData = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title desc bannerImage activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs: blogsData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/all-latest-blogs-count", async (req, res) => {
  try {
    const count = await Blog.countDocuments({ draft: false });
    return res.status(200).json({ totalDocs: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/search-blogs-count", async (req, res) => {
  const { tag, author, query } = req.body;
  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  try {
    const count = await Blog.countDocuments(findQuery);
    return res.status(200).json({ totalDocs: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/search-users", async (req, res) => {
  const { query } = req.body;

  try {
    const userData = await User.find({
      "personal_info.username": new RegExp(query, "i"),
    })
      .select(
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      )
      .limit(50);

    return res.status(200).json({ users: userData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/get-profile", async (req, res) => {
  const { username } = req.body;

  try {
    const userData = await User.findOne({
      "personal_info.username": username,
    }).select("-personal_info.password -google_auth -updatedAt -blogs");

    return res.status(200).json({ user: userData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/get-blog", async (req, res) => {
  const { blogId, draft, mode } = req.body;
  const incrementalVal = mode === "edit" ? 0 : 1;

  try {
    const blogData = await Blog.findOneAndUpdate(
      { blog_id: blogId },
      { $inc: { "activity.total_reads": incrementalVal } }
    )
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .select(
        "title desc content bannerImage activity publishedAt blog_id tags"
      );

    if (blogData.draft && !draft) {
      return res.status(500).json({ error: "You can not access draft blog." });
    }

    try {
      await User.findOneAndUpdate(
        { "personal_info.username": blogData.author.personal_info.username },
        { $inc: { "account_info.total_reads": incrementalVal } }
      );
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ blog: blogData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/like-blog", verifyToken, async (req, res) => {
  const userId = req.user;
  const { _id, isLikedByUser } = req.body;
  const incrementalVal = isLikedByUser ? -1 : 1;

  try {
    const blogData = await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_likes": incrementalVal } }
    );

    try {
      if (!isLikedByUser) {
        const notification = new Notification({
          type: "like",
          blog: _id,
          notification_for: blogData.author,
          user: userId,
        });
        await notification.save();

        return res.status(200).json({ liked_by_user: true });
      } else {
        await Notification.findOneAndDelete({
          type: "like",
          user: userId,
          blog: _id,
        });
        return res.status(200).json({ liked_by_user: false });
      }
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

app.post("/isliked-by-user", verifyToken, async (req, res) => {
  const userId = req.user;
  const { _id } = req.body;

  try {
    const result = await Notification.exists({
      type: "like",
      user: userId,
      blog: _id,
    });
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

app.listen(4000, () => {
  console.log("Listening on port 4000...");
});
