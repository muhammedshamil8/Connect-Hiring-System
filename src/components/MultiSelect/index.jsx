// components/CustomMultiSelect.jsx
import React, { useState, useEffect } from "react";
import { 
  Menu, 
  MenuHandler, 
  MenuList, 
  MenuItem, 
  Checkbox, 
  Button,
  Typography 
} from "@material-tailwind/react";
import { ChevronDownIcon } from "lucide-react";

export default function CustomMultiSelect({ 
  options, 
  value = [], 
  onChange, 
  label = "Select options",
  placeholder = "Select options"
}) {
  const [selectedValues, setSelectedValues] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  const handleCheckboxChange = (optionValue) => {
    const newSelectedValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(item => item !== optionValue)
      : [...selectedValues, optionValue];
    
    setSelectedValues(newSelectedValues);
    onChange(newSelectedValues);
  };

  const displayText = selectedValues.length > 0 
    ? selectedValues.join(", ")
    : placeholder;

  return (
    <Menu open={isOpen} handler={setIsOpen}>
      <MenuHandler>
        <Button
          variant="outlined"
          className="flex items-center justify-between w-full text-left normal-case"
        >
          <Typography className="truncate flex-1">
            {displayText}
          </Typography>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="max-h-64 overflow-y-auto">
        <Typography variant="small" className="font-semibold text-gray-700 px-3 py-2 border-b">
          {label}
        </Typography>
        {options.map((option) => (
          <MenuItem key={option} className="p-0 hover:bg-transparent">
            <label className="flex items-center gap-2 p-3 cursor-pointer w-full hover:bg-gray-50">
              <Checkbox
                checked={selectedValues.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                className="hover:before:opacity-0"
                containerProps={{ className: "p-0" }}
              />
              <Typography className="font-normal">
                {option}
              </Typography>
            </label>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}