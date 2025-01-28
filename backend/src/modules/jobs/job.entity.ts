import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../users/user.entity';

@ObjectType()
export class Job {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => User)
  postedBy: User;

  @Field()
  createdAt: Date;
}
