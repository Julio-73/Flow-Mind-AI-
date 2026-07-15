import { z } from "zod";
import { Email, EmailSchema } from "../value-objects/email.js";
import { Role, RoleSchema } from "../value-objects/role.js";

export interface UserProps {
  id: string;
  email: Email;
  name: string;
  passwordHash: string;
  avatarUrl?: string | null;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: Omit<UserProps, "createdAt" | "updatedAt" | "isActive">): User {
    return new User({
      ...props,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static from(props: UserProps): User {
    return new User(props);
  }

  get id(): string { return this.props.id; }
  get email(): Email { return this.props.email; }
  get name(): string { return this.props.name; }
  get passwordHash(): string { return this.props.passwordHash; }
  get avatarUrl(): string | null | undefined { return this.props.avatarUrl; }
  get isActive(): boolean { return this.props.isActive; }
  get lastLoginAt(): Date | null | undefined { return this.props.lastLoginAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updateProfile(data: { name?: string; avatarUrl?: string | null }): void {
    if (data.name !== undefined) this.props.name = data.name;
    if (data.avatarUrl !== undefined) this.props.avatarUrl = data.avatarUrl;
    this.props.updatedAt = new Date();
  }

  recordLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
