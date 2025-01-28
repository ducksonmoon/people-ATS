import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { User } from './user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async getUsers() {
    return this.usersService.findAll();
  }

  @Mutation(() => User)
  async createUser(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('role', { type: () => Role }) role: Role,
  ) {
    return this.usersService.create({ email, password, role });
  }
}
