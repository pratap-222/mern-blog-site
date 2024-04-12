import React, { useState } from "react";

function CustomInput(props) {
  const { id, type, name, placeholder, icon, value, disable = false } = props;
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <div className="relative w-[100%] mb-4">
      <input
        id={id}
        type={type === "password" && passwordVisible ? "text" : type}
        placeholder={placeholder}
        name={name}
        defaultValue={value}
        className="input-box"
        disabled={disable}
      />

      <i className={`fi ${icon} input-icon`} />

      {type === "password" ? (
        <i
          className={`fi fi-rr-${
            passwordVisible ? "eye" : "eye-crossed"
          } input-icon left-[auto] right-4 cursor-pointer`}
          onClick={() => {
            setPasswordVisible((currentState) => !currentState);
          }}
        />
      ) : undefined}
    </div>
  );
}

export default CustomInput;
