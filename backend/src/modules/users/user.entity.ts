import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field(() => Role)
  role: Role;

  @Field()
  createdAt: Date;
}

registerEnumType(Role, {
  name: 'Role',
  description: 'The roles available for users',
});
