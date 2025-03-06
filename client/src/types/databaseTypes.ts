export type DatabaseType = {
  availableDatabases?: string[];
  columns: DatabaseColumnType[];
  constraints: DatabaseConstraintType[];
  schemas: string[];
  searchExpr: string;
  selectedSchema: string;
  tables: DatabaseTableType[];
};

export type DatabaseColumnType = {
  column_name: string;
  data_type: string;
  ordinal_position: number;
  table_name: string;
  table_schema: string;
};

export type DatabaseConstraintType = {
  constraint_name: string;
  constraint_type: string;
  table_schema: string;
  table_name: string;
  column_name: string;
  foreign_table_schema?: string;
  foreign_table_name?: string;
  foreign_column_name?: string;
};

export type DatabaseTableType = {
  table_name: string;
  table_schema: string;
  table_type: string;
};
