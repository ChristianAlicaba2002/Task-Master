export type TUserForm = {
  email: string;
  password: string;
};

export type TUserDetails = TUserForm & {
  username: string;
  uId: string;
};

export type TTask = {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  priority_level: string;
  status: string;
};

export type TAddTask = {
  user_id?: string;
  title: string;
  description: string;
  priority_level: string;
  status: string;
};

export type TEditTask = TAddTask & {};
