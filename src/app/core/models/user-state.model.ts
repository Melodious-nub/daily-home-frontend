import { User } from './user.model';
import { Mess } from './mess.model';

export interface UserState {
  user: User;
  hasMess: boolean;
  isMessAdmin: boolean;
  currentMess: Mess | null;
  hasPendingRequest: boolean;
  pendingRequestMess: Mess | null;
}

export interface JoinRequest {
  id: string;
  messId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface RequestStatusResponse {
  status: 'accepted' | 'pending' | 'rejected' | 'none';
  message: string;
  mess: {
    id: string;
    name: string;
    address: string;
    identifierCode: string;
  };
  request: {
    id: string;
    requestedAt: string;
  };
}
