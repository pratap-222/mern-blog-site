import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export let activeTabLineRef;
export let activeTabRef;

function InPageNavigation({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) {
  const [inPageNavIndex, setInPageNavIndex] = useState(0);
  activeTabLineRef = useRef();
  activeTabRef = useRef();

  const handleChangePageState = (btn, index) => {
    const { offsetWidth, offsetLeft } = btn;
    activeTabLineRef.current.style.width = offsetWidth + "px";
    activeTabLineRef.current.style.left = offsetLeft + "px";
    setInPageNavIndex(index);
  };

  useEffect(() => {
    handleChangePageState(activeTabRef.current, defaultActiveIndex);
  }, []);

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, index) => {
          return (
            <button
              key={uuidv4()}
              ref={index === defaultActiveIndex ? activeTabRef : undefined}
              className={`p-4 px-5 capitalize ${
                inPageNavIndex === index ? "text-black" : "text-dark-grey"
              } ${defaultHidden.includes(route) ? "md:hidden" : undefined}`}
              onClick={(e) => handleChangePageState(e.target, index)}
            >
              {route}
            </button>
          );
        })}

        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-30" />
      </div>

      {/* Code to render the html code added inside the InPageNavigation component. See where it is called for better understanding */}
      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
}

export default InPageNavigation;
