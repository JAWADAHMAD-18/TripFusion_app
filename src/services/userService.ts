import type { User } from '@/services/authService';
import api, { multipartApi } from '@/services/api';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  profilePic?: {
    uri: string;
    type: string;
    name: string;
  };
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get('/user/me');
  const body = response.data as { data?: { user: User } };
  return body.data!.user;
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<User> {
  const formData = new FormData();

  if (payload.name) {
    formData.append('name', payload.name);
  }

  if (payload.phone) {
    formData.append('phone', payload.phone);
  }

  if (payload.profilePic) {
    formData.append('profilePic', {
      uri: payload.profilePic.uri,
      type: payload.profilePic.type,
      name: payload.profilePic.name,
    } as any);
  }

  const response = await multipartApi.patch('/user/profile-update', formData);
  const body = response.data as { data?: { user: User } };
  return body.data!.user;
}
