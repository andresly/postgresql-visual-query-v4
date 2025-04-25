export type HostType = {
  database: string;
  user: string;
  password: string;
  error: string;
  loggedIn: boolean;
  connected: boolean;
  connecting: boolean;
  psqlVersion: string;
  reservedKeywords: ReservedKeywordType[];
};

export type ReservedKeywordType = {
  word: string;
  catcode: string;
  barelabel: boolean;
  catdesc: 'reserved' | 'unreserved' | 'type_func_name' | 'col_name';
  baredesc: string;
};
