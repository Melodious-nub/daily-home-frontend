export interface Mess {
  id: string;
  name: string;
  identifierCode: string;
  address?: string;
  admin?: {
    fullName: string;
  };
}
