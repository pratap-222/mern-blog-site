import React, { useEffect, useState } from "react";
import InPageNavigation from "../components/InPageNavigation";
import AnimationWrapper from "../components/AnimationWrapper";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Loader from "../components/Loader";
import BlogPostCard from "../components/BlogPostCard";

function HomePage() {
  const [blogs, setBlogs] = useState(null);

  const fetchLatestBlogs = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/latest-blogs`)
      .then(({ data }) => {
        setBlogs(data.blogs);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchLatestBlogs();
  }, []);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* Latest blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={["home", "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : (
                blogs.map((blog, index) => {
                  return (
                    <AnimationWrapper
                      key={uuidv4()}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              )}
            </>
            <h1>Trending blogs here</h1>
          </InPageNavigation>
        </div>

        {/* Trending blogs */}
        <div></div>
      </section>
    </AnimationWrapper>
  );
}

export default HomePage;
