import { Role, Tag } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";

export type UserRegister = {
  name:string;
  email :string;
  password  :string;
  passwordConfirm: string;
  role: Role;
}
