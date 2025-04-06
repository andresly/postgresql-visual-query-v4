import scalarFunctionsArray from '../config/scalarFunctions.json';
import aggregateFunctionsArray from '../config/aggregateFunctions.json';

/**
 * Get available scalar functions for PostgreSQL
 * @returns Array of scalar function names
 */
export const getScalarFunctions = (): string[] => {
  // Check if environment variable exists and use it as fallback
  const envScalarFunctions = process.env.REACT_APP_SCALAR_FUNCTIONS?.split(',') || [];

  // Use JSON file as primary source
  return scalarFunctionsArray.length ? scalarFunctionsArray : envScalarFunctions;
};

/**
 * Get available aggregate functions for PostgreSQL
 * @returns Array of aggregate function names
 */
export const getAggregateFunctions = (): string[] => {
  // Check if environment variable exists and use it as fallback
  const envAggregateFunctions = process.env.REACT_APP_SINGE_LINE_FUNCTIONS?.split(',') || [];

  // Use JSON file as primary source
  return aggregateFunctionsArray.length ? aggregateFunctionsArray : envAggregateFunctions;
};
