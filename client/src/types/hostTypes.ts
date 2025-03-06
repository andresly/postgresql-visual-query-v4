export type Host = {
  database: string;
  user: string;
  password: string;
  error: string;
  loggedIn: boolean;
  connected: boolean;
  connecting: boolean;
  psqlVersion: string;
};
