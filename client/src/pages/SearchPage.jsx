import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InPageNavigation from "../components/InPageNavigation";
import Loader from "../components/Loader";
import AnimationWrapper from "../components/AnimationWrapper";
import BlogPostCard from "../components/BlogPostCard";
import NoDataMessage from "../components/NoDataMessage";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import axios from "axios";
import { FilterPaginationData } from "../common/FilterPaginationData";
import UserCard from "../components/UserCard";
import { v4 as uuidv4 } from "uuid";

function SearchPage() {
  const { query } = useParams();
  const [blogs, setBlogs] = useState(null);
  const [users, setUsers] = useState(null);

  const searchBlog = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/search-blogs`, { query, page })
      .then(async ({ data }) => {
        const formattedBlogsData = await FilterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { query },
          create_new_arr,
        });

        setBlogs(formattedBlogsData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const searchUsers = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/search-users`, { query })
      .then(async ({ data: { users } }) => {
        setUsers(users);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  useEffect(() => {
    resetState();
    searchBlog({ page: 1, create_new_arr: true });
    searchUsers();
  }, [query]);

  const UserCardWrapper = () => {
    return (
      <>
        {users === null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, index) => {
            return (
              <AnimationWrapper
                key={uuidv4()}
                transition={{ duration: 1, delay: index * 0.08 }}
              >
                <UserCard user={user} />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message="No user found" />
        )}
      </>
    );
  };

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search Results from ${query}`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
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

            <LoadMoreDataBtn state={blogs} fetchDataFunc={searchBlog} />
          </>

          <UserCardWrapper />
        </InPageNavigation>
      </div>

      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="font-medium text-xl mb-8 items-center">
          User related to search <i className="fi fi-rr-user mt-2 ml-2" />
        </h1>

        <UserCardWrapper />
      </div>
    </section>
  );
}

export default SearchPage;
