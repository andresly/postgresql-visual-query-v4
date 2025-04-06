This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Setup

Download dependencies by running `npm install` in this directory.

## Development

In this directory run `npm start`

# PostgreSQL Function Configuration

This directory contains configuration files that define the available PostgreSQL functions that can be used in the query builder.

## Files

- `scalarFunctions.json`: Contains an array of available scalar functions (string manipulation, math, etc.)
- `aggregateFunctions.json`: Contains an array of available aggregate functions (grouping operations)

## How to Modify

To add, remove, or modify the available functions:

1. Open the appropriate JSON file
2. Edit the array, maintaining the JSON array format
3. Save the file

**NB! The last element in the array must not be followed by a comma.**

Example format:

```json
["FUNCTION_NAME_1", "FUNCTION_NAME_2", "FUNCTION_NAME_3"]
```

## Notes

- Function names should be in uppercase for consistency
- No commas after the last element in the array
- The application will fall back to environment variables if these files are empty or not found

## Environment Variable Fallbacks

If these files are not available, the application will fall back to the following environment variables:

- `REACT_APP_SCALAR_FUNCTIONS`: Comma-separated list of scalar functions
- `REACT_APP_SINGE_LINE_FUNCTIONS`: Comma-separated list of aggregate functions

