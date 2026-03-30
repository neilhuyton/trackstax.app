import React, { useCallback, useEffect, useRef, useState } from "react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  inputClass?: string;
  spanClass?: string;
  inputType?: string;
  title?: string;
  maxLength?: number;
  minLength?: number;
}

export const InlineEdit = ({
  value,
  onSave,
  inputClass = "",
  spanClass = "",
  inputType = "text",
  title,
  maxLength = 100,
  minLength = 1,
}: InlineEditProps) => {
  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sanitizeInput = useCallback(
    (input: string): string => {
      if (!input) return "";
      const sanitized = input
        .replace(/<[^>]*>/g, "")
        .replace(/[^\p{L}\p{N}\p{P}\s]/gu, "");
      return sanitized.slice(0, maxLength);
    },
    [maxLength],
  );

  const sanitizeForSave = useCallback(
    (input: string): string => {
      return sanitizeInput(input).trim();
    },
    [sanitizeInput],
  );

  useEffect(() => {
    setInputValue(sanitizeInput(value));
  }, [sanitizeInput, value]);

  useEffect(() => {
    if (inputRef.current && editMode) {
      inputRef.current.focus();
    }
  }, [editMode]);

  const validateInput = (input: string): boolean => {
    const sanitized = sanitizeForSave(input);
    if (sanitized.length < minLength) {
      setError(`Input must be at least ${minLength} characters`);
      return false;
    }
    if (sanitized.length > maxLength) {
      setError(`Input must not exceed ${maxLength} characters`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const sanitizedValue = sanitizeInput(newValue);
    setInputValue(sanitizedValue);
    validateInput(newValue);
  };

  const handleSave = () => {
    const sanitizedValue = sanitizeForSave(inputValue);
    if (validateInput(inputValue)) {
      onSave(sanitizedValue);
      setEditMode(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave();
    } else if (event.key === "Escape") {
      setInputValue(value);
      setEditMode(false);
      setError(null);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");
    const sanitized = sanitizeInput(pasted);
    if (sanitized !== pasted) {
      event.preventDefault();
      setInputValue(sanitized);
    }
  };

  const sanitizedValue = sanitizeInput(value);

  return (
    <div className="w-full h-full">
      {editMode ? (
        <>
          <input
            type={inputType}
            ref={inputRef}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`${inputClass} ${error ? "border-red-500" : ""}`}
            maxLength={maxLength}
            aria-label={title || "Editable field"}
            onPaste={handlePaste}
          />
          {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
        </>
      ) : (
        <div
          onClick={() => setEditMode(true)}
          className={`${spanClass} cursor-pointer`}
          title={title}
          dangerouslySetInnerHTML={{ __html: sanitizedValue }}
        />
      )}
    </div>
  );
};

export default InlineEdit;
