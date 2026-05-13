export interface WorkspaceResponse {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
  created_at: string;
}

export interface WorkspaceMemberResponse {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface WorkspaceDetailResponse extends WorkspaceResponse {
  members: WorkspaceMemberResponse[];
}
