import React, { forwardRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export type InputCommonProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  isRequired?: boolean;
  error?: string | null;
  showLabel?: boolean;
};

const DEFAULT_INPUT_CLASS =
  "input-field w-full py-4 px-5 bg-white bg-opacity-10 border-2 border-white border-opacity-20 rounded-xl text-gray-800 text-base transition-all duration-300 backdrop-blur-md focus:outline-none focus:border-[var(--tertiary)] focus:bg-white focus:bg-opacity-20 focus:translate-y-[-2px] focus:shadow-lg placeholder:text-gray-600 placeholder:text-opacity-70";

const InputCommon = forwardRef<HTMLInputElement, InputCommonProps>(
({ label, isRequired = false, type = "text", error = null, className = "", id, name, showLabel = true, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    // Support both standard password and custom 'repeat-password' type used in examples
  const lowerName = String(name ?? "").toLowerCase();
  const isPasswordLike = type === "password" || type === "repeat-password" || lowerName.includes("password");

    // When callers use type='repeat-password' (invalid HTML type) we render as password
    const renderedType = type === "repeat-password" ? "password" : type;
    const inputType = isPasswordLike && showPassword ? "text" : renderedType;

    return (
      <div className="mb-4">
        {label && showLabel && (
          <label className="block text-sm font-medium text-white mb-2" htmlFor={id || name}>
            {label} {isRequired && <span className="text-red-400">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={id}
            name={name}
            type={inputType}
            className={`${DEFAULT_INPUT_CLASS} ${className ?? ""} ${error ? "ring-2 ring-red-500" : ""}`}
            {...rest}
          />

          {isPasswordLike && (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          )}
        </div>

        {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
      </div>
    );
  }
);

InputCommon.displayName = "InputCommon";
export default InputCommon;