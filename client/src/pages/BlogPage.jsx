import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import AnimationWrapper from "../components/AnimationWrapper";
import { getDay } from "../common/date";
import BlogInteraction from "../components/BlogInteraction";
import BlogPostCard from "../components/BlogPostCard";
import { v4 as uuidv4 } from "uuid";
import BlogContent from "../components/BlogContent";
import CommentsContainer, {
  fetchComments,
} from "../components/CommentsContainer";

export const blogStructure = {
  title: "",
  desc: "",
  content: [],
  tags: [],
  author: { personal_info: {} },
  bannerImage: "",
  publishedAt: "",
};

export const BlogContext = createContext({});

function BlogPage() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [similarBlogs, setSimilarBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setLikedByUser] = useState(false);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  const {
    title,
    desc,
    content,
    tags,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    bannerImage,
    publishedAt,
  } = blog;

  const fetchBlog = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/get-blog`, { blogId })
      .then(async ({ data: { blog } }) => {
        blog.comments = await fetchComments({
          blog_id: blog._id,
          setParentCommentCountFunc: setTotalParentCommentsLoaded,
        });

        setBlog(blog);

        try {
          const {
            data: { blogs },
          } = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/search-blogs`,
            { tag: blog.tags[0], limit: 6, eliminate_blog: blogId }
          );

          setSimilarBlogs(blogs);
        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetStates();
    fetchBlog();
  }, [blogId]);

  const resetStates = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            isLikedByUser,
            setLikedByUser,
            commentsWrapper,
            setCommentsWrapper,
            totalParentCommentsLoaded,
            setTotalParentCommentsLoaded,
          }}
        >
          <CommentsContainer />

          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={bannerImage} alt="blog_banner" className="aspect-video" />

            <div className="mt-12">
              <h2>{title}</h2>

              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-start">
                  <img
                    src={profile_img}
                    alt="author_profile_pic"
                    className="w-12 h-12 rounded-full"
                  />
                  <p className="capitalize">
                    {fullname}
                    <br />
                    <Link to={`/user/${author_username}`} className="underline">
                      @{author_username}
                    </Link>
                  </p>
                </div>

                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Published on {getDay(publishedAt)}
                </p>
              </div>
            </div>

            <BlogInteraction />

            <div className="my-12 font-gelasio blog-page-content">
              {content[0].blocks.map((block, index) => {
                return (
                  <div key={uuidv4()} className="my-4 md:my-8">
                    <BlogContent block={block} />
                  </div>
                );
              })}
            </div>

            <BlogInteraction />

            {similarBlogs !== null && similarBlogs.length ? (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">
                  Similar Blogs
                </h1>

                {similarBlogs.map((blog, index) => {
                  const {
                    author: { personal_info },
                  } = blog;
                  return (
                    <AnimationWrapper
                      key={index}
                      transition={{ duration: 1, delay: index * 0.08 }}
                    >
                      <BlogPostCard content={blog} author={personal_info} />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : undefined}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
}

export default BlogPage;
