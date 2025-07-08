export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  image: string;
  age: number;
  birthDate: string;
  gender: string;
  address: {
    address: string;
    city: string;
    postalCode: string;
    state: string;
    country: string;
  };
  company: {
    name: string;
    title: string;
    department: string;
  };
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
}

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserFilters {
  search: string;
  sortBy: keyof User | 'company.name' | 'address.city';
  sortOrder: 'asc' | 'desc';
  limit: number;
  skip: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface DirectoryState {
  users: User[];
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  pagination: PaginationInfo;
  searchHistory: string[];
  cache: Map<string, UsersResponse>;
}
