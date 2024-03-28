import React from "react";
import { v4 as uuidv4 } from "uuid";

const Img = ({ url, caption }) => {
  return (
    <div>
      <img src={url} alt="blog_content_image" />
      {caption.length ? (
        <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">
          {caption}
        </p>
      ) : undefined}
    </div>
  );
};

const Quote = ({ quote, caption }) => {
  return (
    <div className="bg-purple/10 p-3 pl-5 border-l-4 border-purple">
      <p className="text-xl leading-10 md:text-2xl">{quote}</p>
      {caption.length ? (
        <p className="w-full text-purple text-base">{caption}</p>
      ) : undefined}
    </div>
  );
};

const List = ({ style, items }) => {
  return (
    <ol
      className={`pl-5 ${style === "ordered" ? " list-decimal" : "list-disc"}`}
    >
      {items.map((item) => {
        return (
          <li
            dangerouslySetInnerHTML={{ __html: item }}
            key={uuidv4()}
            className="my-4"
          />
        );
      })}
    </ol>
  );
};

function BlogContent({ block }) {
  const { type, data } = block;

  if (type === "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: data.text }} />;
  }

  if (type === "header") {
    if (data.level === 3) {
      return (
        <h3
          className="text-3xl font-bold"
          dangerouslySetInnerHTML={{ __html: data.text }}
        />
      );
    }

    return (
      <h2
        className="text-4xl font-bold"
        dangerouslySetInnerHTML={{ __html: data.text }}
      />
    );
  }

  if (type === "image") {
    return <Img url={data.file.url} caption={data.caption} />;
  }

  if (type === "quote") {
    return <Quote quote={data.text} caption={data.caption} />;
  }

  if (type === "list") {
    return <List style={data.style} items={data.items} />;
  } else {
    return (
      <h1>*************************** Remaining ************************</h1>
    );
  }
}

export default BlogContent;
