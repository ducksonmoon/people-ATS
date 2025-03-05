import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async getUsers() {
    return this.usersService.findAllUsers();
  }

  @Mutation(() => User)
  async createUser(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('role', { type: () => Role }) role: Role,
    @Args('name') name: string,
  ) {
    const userData: CreateUserDto = {
      email,
      password,
      role,
      name,
    };
    return this.usersService.createUser(userData);
  }
}
