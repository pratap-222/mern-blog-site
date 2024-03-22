import React, { useEffect, useState } from "react";
import InPageNavigation from "../components/InPageNavigation";
import AnimationWrapper from "../components/AnimationWrapper";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Loader from "../components/Loader";
import BlogPostCard from "../components/BlogPostCard";
import MinimalBlogPost from "../components/MinimalBlogPost";
import { activeTabRef } from "../components/InPageNavigation";
import NoDataMessage from "../components/NoDataMessage";
import { FilterPaginationData } from "../common/FilterPaginationData";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";

function HomePage() {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");
  const categories = [
    "hollywood",
    "bollywood",
    "tollywood",
    "bhojpuri",
    "marathi",
    "tech",
    "culture",
    "travel",
    "cooking",
    "finance",
    "politics",
  ];

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/latest-blogs`, { page })
      .then(async ({ data }) => {
        const formattedBlogsData = await FilterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blogs-count",
        });

        setBlogs(formattedBlogsData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/trending-blogs`)
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/search-blogs`, {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        const formattedBlogsData = await FilterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { tag: pageState },
        });
        setBlogs(formattedBlogsData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleCategorywiseBlogs = (e) => {
    const category = e.target.innerText.toLowerCase();
    setBlogs(null);

    if (pageState === category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState === "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }

    if (trendingBlogs === null) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  const TrendingBlogsWrapper = () => {
    return (
      <>
        {trendingBlogs === null ? (
          <Loader />
        ) : trendingBlogs.length > 0 ? (
          trendingBlogs.map((blog, index) => {
            return (
              <AnimationWrapper
                key={uuidv4()}
                transition={{ duration: 1, delay: index * 0.1 }}
              >
                <MinimalBlogPost
                  content={blog}
                  author={blog.author.personal_info}
                  index={index}
                />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message="No trending blogs found" />
        )}
      </>
    );
  };

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            {/* Latest blogs */}
            <>
              {blogs === null ? (
                <Loader />
              ) : blogs.results.length > 0 ? (
                blogs.results.map((blog, index) => {
                  return (
                    <AnimationWrapper
                      key={index}
                      transition={{ duration: 1, delay: (index % 5) * 0.1 }}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No blogs published" />
              )}

              <LoadMoreDataBtn
                state={blogs}
                fetchDataFunc={
                  pageState === "home" ? fetchLatestBlogs : fetchBlogsByCategory
                }
              />
            </>

            {/* Trending blogs */}

            <TrendingBlogsWrapper />
          </InPageNavigation>
        </div>

        {/* Fliters and Trending blogs */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories from all interests
              </h1>

              <div className="flex gap-3 flex-wrap">
                {categories.map((category) => {
                  return (
                    <button
                      className={`tag ${
                        category === pageState ? "bg-black text-white" : ""
                      }`}
                      key={uuidv4()}
                      onClick={handleCategorywiseBlogs}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up" />
              </h1>

              <TrendingBlogsWrapper />
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
}

export default HomePage;
