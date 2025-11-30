import React, { useState, useEffect, useRef } from "react";
import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
  Checkbox,
  Typography,
  Input,
} from "@material-tailwind/react";
import { ChevronDownIcon, X } from "lucide-react";

export default function CustomMultiSelect({
  options,
  value = [],
  onChange,
  label = "Select options",
  placeholder = "Select options",
}) {
  const [selectedValues, setSelectedValues] = useState(value);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  const handleCheckboxChange = (val) => {
    const newValues = selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];

    setSelectedValues(newValues);
    onChange(newValues);
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayText =
    selectedValues.length > 0 ? selectedValues.join(", ") : placeholder;

  return (
    <Popover open={isOpen} handler={setIsOpen} placement="bottom-start">
      <PopoverHandler>
        <Button
          variant="outlined"
          className="flex items-center justify-between w-full normal-case"
        >
          <Typography className="truncate flex-1">{displayText}</Typography>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </PopoverHandler>

      <PopoverContent className="min-w-[280px] max-w-[320px] max-h-[300px] overflow-y-auto p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <Typography variant="small" className="font-semibold text-gray-800">
            {label}
          </Typography>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <Input
            size="sm"
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="p-1">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              No results
            </div>
          ) : (
            filteredOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
              >
                <Checkbox
                  checked={selectedValues.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
                <Typography className="text-sm">{option}</Typography>
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
